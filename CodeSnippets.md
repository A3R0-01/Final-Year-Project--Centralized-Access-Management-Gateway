
### Project Overview

This project, titled "Development of a Centralized Gateway for Access Management of Decentralized Government Platforms/Services," is a capstone project that aims to solve the problem of fragmented, siloed, and inefficient digital government services in Zimbabwe. The core idea is to create a single, unified entry point—a centralized gateway—that manages user authentication, authorization, and access to various backend government services, which can remain decentralized.

The project is architecturally divided into two main components:

1.  A **Django (Python) Backend** that serves as the central management system or "control plane." It handles the database, user roles, service definitions, permissions, and logging.
2.  A **Go (Golang) Gateway** that acts as the high-performance reverse proxy. It is the public-facing entry point that processes all incoming user requests, consults the Django backend for rules, and forwards traffic to the appropriate downstream service.

-----

### **Part 1: The Django Backend (Control Plane)**

The backend is built using the Django Rest Framework and acts as the authoritative source for the entire system. Its primary responsibilities include defining the data structures for users, services, and permissions, and exposing this logic through a well-defined API.

#### **1.1 User and Role Management**

The system defines a clear hierarchy of user roles, starting with the base user, the **Citizen**. The primary user model for the entire system is explicitly set to `citizen.Citizen`.

```python
// From: core/citizen/models.py

class Citizen(AbstractBaseUser, PermissionsMixin):
    PublicId = models.UUIDField(unique=True, db_index=True, editable=False,default=uuid.uuid4)
    UserName = models.CharField(max_length=100, unique=True)
    FirstName = models.CharField(max_length=100)
    # ...
    NationalId = models.CharField(max_length=40)
    DOB = models.DateTimeField()
    Email = models.EmailField(unique=True)
    # ...
    objects: CitizenManager = CitizenManager()
```

On top of the `Citizen` model, there are several specialized administrative roles, each with a `OneToOneField` relationship to a `Citizen` account, effectively extending the base user with specific privileges:

  * **SiteManager**: The super administrator with top-level control.
  * **Administrator**: A role responsible for managing a specific `Department`.
  * **Grantee**: A user responsible for managing and granting access to a specific `PublicService`.

The separation of roles is enforced at the API level using custom authentication classes, ensuring that only users with the correct role can access specific endpoints.

```python
// From: core/abstract/authenticationClasses.py

class IsAdministrator(JWTAuthentication):
    def authenticate(self, request):
        data = super().authenticate(request)
  
        if data == None:
            raise AuthenticationFailed('Invalid Credentials. Please Login')
        authenticatedUser, token = data
        if hasattr(authenticatedUser, 'administrator'):
            return authenticatedUser, token
        raise AuthenticationFailed('Invalid Credentials. Please Login')
```

#### **1.2 Service and Permission Management (The Core Logic)**

This is the heart of the Django backend, where the rules for what services exist and who can access them are defined and enforced. This is accomplished through a tight integration of Models, Serializers, and ViewSets.

##### **1.2.1 How Services are Managed**

A "Service" represents a distinct government function that a citizen can interact with. The architecture models a real-world government hierarchy to control how these services are defined, managed, and exposed.

  * **The Service Data Models:** These establish the relationships between different organizational units.

      * **`PublicService` Model:** This is the core model representing an individual service. It contains the essential information for the gateway to route requests (`URL`, `MachineName`), its place in the hierarchy (linking to an `Association`), and the `Grantee`s responsible for it. The `Restricted` field determines if the service is visible to the public by default.

        ```python
        // From: core/publicService/models.py

        class PublicService(AbstractModel):
            Title = models.CharField(max_length=100, unique=True)
            MachineName = models.CharField(max_length=150, unique=True)
            Description = models.TextField()
            Email = models.EmailField(unique=True)
            Grantee = models.ManyToManyField(to='grantee.Grantee')
            Association = models.ForeignKey(to='association.Association', on_delete=models.PROTECT)
            Restricted = models.BooleanField(default=False)
            URL = models.URLField(unique=True)
            Visibility = models.BooleanField(default=True)
        ```

      * **`Association` and `Department` Models:** These models create the organizational hierarchy. An `Association` is a group of related services that belongs to a larger `Department`.

        ```python
        // From: core/association/models.py
        class Association(AbstractModel):
            Title = models.CharField(max_length=100, unique=True)
            Department = models.ForeignKey(to='department.Department', on_delete=models.PROTECT)
            # ...

        // From: core/department/models.py
        class Department(AbstractModel):
            Title = models.CharField(max_length=100, unique=True)
            Administrator = models.OneToOneField(to='administrator.Administrator', on_delete=models.PROTECT)
            # ...
        ```

  * **The Service Serializers:** These act as translators between the database models and the JSON API, controlling what information is exposed to different user roles.

      * **`CitizenPublicServiceSerializer`:** This is the "public" view of a service. It is intentionally limited and does not expose sensitive administrative details like the list of `Grantee`s.

        ```python
        // From: core/publicService/serializers.py

        class CitizenPublicServiceSerializer(AbstractModelSerializer):
            Association = SlugRelatedField(queryset=Association.objects.all(), slug_field='PublicId')
            
            def to_representation(self, instance:PublicService):
                data = super().to_representation(instance)
                data['Association'] = PublicServiceAssociationSerializer(instance.Association).data
                return data

            class Meta:
                model : PublicService = PublicService
                fields : list[str] = [
                    'id','Title', "MachineName", 'Email', 'Association','Restricted', 'Description', 'URL', 'Created', 'Updated'
                ]
        ```

  * **The Service ViewSets:** These contain the business logic that enforces who can see and do what.

      * **`AdministratorPublicServiceViewSet`:** This `ViewSet` demonstrates how access is scoped. An `Administrator` can only manage services that fall under their assigned `Department`.

        ```python
        // From: core/publicService/viewset.py

        class AdministratorPublicServiceViewSet(AbstractAdministratorModelViewSet):
            # ...
            def get_queryset(self):
                if hasattr(self.request.user, 'administrator') and hasattr(self.request.user.administrator, 'department'):
                    department = self.request.user.administrator.department
                    associations = Association.objects.filter(Department=department)
                    queries = self.get_queries()
                    queries['Association__in'] = associations
                    return self.serializer_class.Meta.model.objects.filter(**queries)
                raise MethodNotAllowed('GET')
        ```

##### **1.2.2 How Permissions are Managed**

Permissions are the mechanism for granting temporary, explicit access to services that are otherwise restricted.

  * **The Permission Data Models:** The system is built on an abstract base model, which is then extended for different resource types.

      * **`AbstractPermission` Model:** This base model defines the core components of any permission: who it's for (`Citizens`), what it's called (`Name`), and for how long it's valid (`StartTime`, `EndTime`).

        ```python
        // From: core/abstract_circular/models.py

        class AbstractPermission(AbstractModel):
            Name = models.CharField(max_length=100)
            Description = models.TextField()
            Citizens = models.ManyToManyField(to='citizen.Citizen')
            StartTime = models.DateTimeField()
            EndTime = models.DateTimeField()

            @property
            def permission_open(self):
                time = timezone.now()
                return self.StartTime <= time <= self.EndTime
        ```

      * **Concrete Permission Models:** This abstract model is then made concrete by linking it to a specific resource (e.g., `PublicServicePermission`, `AssociationPermission`).

        ```python
        // From: core/servicePermissions/models.py

        class PublicServicePermission(AbstractPermission):
            PublicService = models.ForeignKey(to='publicService.PublicService', on_delete=models.CASCADE)

        class AssociationPermission(AbstractPermission):
            Association = models.ForeignKey(to='association.Association', on_delete=models.CASCADE)
        ```

  * **The Permission Serializers:** These handle creating new rules and displaying existing ones.

      * **`PublicServicePermissionSerializer`:** When creating a permission, an administrator sends the `PublicId` of the service and citizens. When retrieving a permission, the `to_representation` method uses nested serializers to embed the full details.

        ```python
        // From: core/servicePermissions/serializers.py

        class PublicServicePermissionSerializer(AbstractPermissionSerializer):
            PublicService = SlugRelatedField(queryset=PublicService.objects.all(), slug_field='PublicId')

            def to_representation(self, instance):
                data = super().to_representation(instance)
                data['PublicService'] = PermissionPublicServiceSerializer(instance.PublicService).data
                return data
        ```

  * **The Permission ViewSets:** These ensure that only authorized personnel can create or modify permissions within their scope of control.

      * **`AdministratorPublicServicePermissionViewSet`:** This `ViewSet` prevents an administrator from granting permissions for services outside of their own department.

        ```python
        // From: core/servicePermissions/viewsets.py

        class AdministratorPublicServicePermissionViewSet(AbstractAdministratorModelViewSet):
            # ...
            def create(self, request, *args, **kwargs):
                administrator = self.request.user.administrator
                publicServiceId = request.data.get('PublicService')

                if not publicServiceId:
                    raise ValidationError('Invalid Service')

                if hasattr(administrator, 'department'):
                    try:
                        associations = Association.objects.filter(Department=administrator.department)
                        publicSrvc = PublicService.objects.filter(Association__in=associations).get(PublicId=publicServiceId)
                        request.data['PublicService'] = publicSrvc.PublicId.hex
                    except PublicService.DoesNotExist:
                        raise ValidationError('Invalid Service')

                    return super().create(request, *args, **kwargs)
                
                raise MethodNotAllowed('You Do Not Belong to Any Department')
        ```

##### **1.2.3 The `CitizenPublicServiceViewSet`: A Citizen's Personalized Service Directory**

This specific API endpoint is responsible for providing a list of government services to a regular, authenticated citizen. It dynamically constructs a unique list of services for each citizen based on a multi-layered permission model.

  * **Core Logic: The `get_queryset` Method:** When a citizen makes a `GET` request to the `/api/service/` endpoint, this method intelligently combines the results of four different queries to build the final, personalized list.

    ```python
    // From: core/publicService/viewset.py

    class CitizenPublicServiceViewSet(AbstractModelViewSet):
        # ...
        def get_queryset(self):
            by_service_permission = self.getQ_PublicService_Service()
            by_association_permission = self.getQ_PublicService_Association()
            by_department_permission = self.getQ_PublicService_Department()
            by_publicity = self.getQ_PublicService_Restricted()

            return by_publicity.union(by_department_permission).union(by_association_permission).union(by_service_permission)
    ```

    This method checks for:

    1.  Publicly available services (`Restricted=False`).
    2.  Granular permissions granted directly to the user for a specific service.
    3.  Permissions granted at the association level.
    4.  The broadest permissions granted at the department level.

  * **Securely Fetching a Single Service: The `get_object` Method:** When a citizen requests the details of a single service, this method provides an additional layer of security by re-running the same permission logic to ensure the user is authorized to view that specific service.

    ```python
    // From: core/publicService/viewset.py

    def get_object(self):
        id = self.kwargs['pk']
        obj = None
        for func in [self.getQ_PublicService_Association, self.getQ_PublicService_Department, self.getQ_PublicService_Restricted, self.getQ_PublicService_Service]:
            try:
                obj = func().get(PublicId=id)
                if obj:
                    break
            except (ObjectDoesNotExist, ValidationError_Django, ValueError, TypeError):
                continue
        if obj:
            self.check_object_permissions(self.request, obj)
            return obj
        raise NotFound("Service Not Found")
    ```

-----

### **Part 2: The Go Gateway (Reverse Proxy)**

The Go application is the high-performance gateway that sits in front of all government services. It's built using the `go-kit` toolkit, which encourages a microservices-oriented approach.

#### **2.1 Dynamic Service Discovery**

The gateway is not hard-coded. On startup, it dynamically fetches the list of available public services from the Django backend. For each fetched service, it creates a **reverse proxy** responsible for forwarding user requests to the actual backend service's URL.

```go
// From: central-gateway/kitGateway/system/server.go

func (srv *Server) FetchServices() *[]types.PublicService {
	req, err := http.NewRequest("GET", types.CentralDomain+"manager/service/", nil)
	if err != nil {
		log.Fatal("ServerStartUp::\n Failed to generate request(fetchServices)")
	}
	req.Header.Set("Authorization", "Bearer "+srv.Credentials.Access)
    // ... executes request and decodes the list of services
}
```

#### **2.2 Middleware for Logging and Metrics**

The gateway uses a middleware pattern to wrap core service logic with additional functionality.

1.  **Instrumenting Middleware**: This captures metrics for every request (latency, error counts) using Prometheus for monitoring.
2.  **Logging Middleware**: After a request is processed, this middleware constructs a detailed log entry and sends it back to the Django backend's API endpoint, centralizing all system activity logs.

<!-- end list -->

```go
// From: central-gateway/kitGateway/service/middleware.go

func (md *LoggingMiddleware) LogData(auth *types.Authenticator) error {
	logOutput, err := auth.SystemLog.GenerateLog()
    // ...
	jsonLog, err := json.Marshal(logOutput)
    // ...
	req, err := http.NewRequest("POST", types.CentralDomain+"manager/log/manager/", bytes.NewBuffer(jsonLog))
    // ...
	req.Header.Add("Authorization", "Bearer "+md.Credentials.Access)
    // ...
	resp, err := http.DefaultClient.Do(req)
    // ...
	return nil
}
```

#### **2.3 URL and Content Rewriting**

To create a seamless experience, the gateway rewrites HTML, CSS, and JSON content in the responses from backend services. It finds URLs pointing to the original service and rewrites them to point to the gateway's domain.

```go
// From: central-gateway/kitGateway/service/modify.go

func injectBaseTag(html []byte, serviceMachineName string, originalDomain string) []byte {
	re := regexp.MustCompile(`href\s*=\s*"(.*?)"`)

	updated := re.ReplaceAllFunc(html, func(match []byte) []byte {
		//...
		cleanPath := strings.TrimLeft(original, "/.")
		newHref := types.GatewayDomain + "/" + serviceMachineName + "/" + cleanPath
		return []byte(`href="` + newHref + `"`)
	})

	return updated
}
```