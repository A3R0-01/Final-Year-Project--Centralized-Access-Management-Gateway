# Project Guideline: Centralized Access Management Gateway

This document provides a comprehensive guideline for the "Centralized Access Management Gateway" project, outlining its purpose, architecture, key functionalities, detailed instructions on how different user roles interact with the system from a frontend perspective, and setup/deployment including monitoring configurations.

## Table of Contents

1.  **Project Overview**
2.  **System Architecture**
3.  **Key Technologies**
4.  **User Roles and Frontend Portal Usage**
    * Citizen Portal Usage
    * Administrator Portal Usage
    * Grantee Portal Usage
    * Site Manager Portal Usage
5.  **Core Functionalities**
6.  **Setup and Deployment**
    * Grafana Instructions
7.  **Further Development and Improvements**
8.  **Code Snippets & Explanations**

## 1\. Project Overview

The Centralized Access Management Gateway is designed to provide a robust and secure system for managing user access to various public services. It aims to centralize user authentication, authorization, and service access requests, ensuring controlled and logged interactions within a multi-tiered administrative and citizen-facing environment. The system facilitates a streamlined process for citizens to request and gain access to services, while providing various levels of administrative control for government entities to manage these services and user permissions.

## 2\. System Architecture

The system is composed of several interconnected components, designed for modularity, scalability, and performance:

  * **Central Gateway (GoLang)**: This serves as the primary entry point for all service requests. Built with GoLang, it is optimized for high performance, handling authentication, authorization, and intelligent routing of requests to the appropriate backend services. It also integrates core functionalities for comprehensive logging and real-time metrics collection, acting as a crucial security and traffic management layer.
  * **Core Access Management (Django/Python)**: This component represents the robust backend API, developed using Django (Python). It is responsible for managing all core entities and business logic, including user profiles, departmental structures, organizational associations, a catalog of public services, service requests, and access grants. It interacts seamlessly with a PostgreSQL database to ensure data integrity and persistence.
  * **Frontend (Next.js/TypeScript)**: The user-facing interface of the system is a modern web application built with Next.js (React) and TypeScript. It offers distinct portals tailored for different user roles—Citizen, Site Manager, Administrator, and Grantee—providing intuitive interfaces for interacting with the system's functionalities.
  * **Monitoring (Prometheus & Grafana)**: For operational visibility and system health, the project integrates with Prometheus for collecting various system and application metrics, and Grafana for visualizing these metrics through interactive dashboards, enabling proactive monitoring and issue detection.

**NB: FOR NEWLY REGISTERED SERVICES TO BE INCOPERATED IN THE SYSTEM THE GATEWAY HAS TO ME REBOOTED, AS SUCH I RECOMMEND THAT ALL REBOOTS TAKE PLACE AT MIDNIGHT**

## 3\. Key Technologies

The project leverages a modern and robust technology stack, chosen for its efficiency, security features, and community support:

  * **Backend**:
      * **GoLang**: Utilized for the Central Gateway due to its strong concurrency support and performance, making it ideal for handling high volumes of requests efficiently.
      * **Django (Python)**: Provides a high-level Python web framework for rapid development of secure and maintainable web applications, forming the core of the access management API.
      * **Django REST Framework**: Extends Django to simplify the development of RESTful APIs, providing powerful tools for serialization, authentication, and viewsets.
      * **Django Simple JWT**: Implements JSON Web Token (JWT) based authentication, offering a stateless and secure method for API authentication.
      * **PostgreSQL**: A powerful, open-source relational database system chosen for its reliability, data integrity, and advanced features, serving as the primary data store.
      * **Celery**: An asynchronous task queue that enables the Django application to offload time-consuming operations (like background processing of system logs) to background workers, improving responsiveness.
      * **Confluent Kafka Go / Kafka Python**: Used for distributed streaming platform capabilities, facilitating high-throughput and low-latency inter-service communication and efficient system logging.
      * **`django-prometheus`**: A library that exposes Prometheus metrics directly from the Django application, enabling detailed monitoring of the backend.
  * **Frontend**:
      * **Next.js (React/TypeScript)**: A React framework that supports server-side rendering and static site generation, enhancing performance and SEO. TypeScript ensures type safety and improves code quality.
      * **Tailwind CSS**: A utility-first CSS framework that speeds up UI development by providing low-level utility classes.
      * **Shadcn UI**: A collection of re-usable components built with Radix UI and Tailwind CSS, designed to be easily customizable and integrated into Next.js projects.
  * **DevOps/Monitoring**:
      * **Docker & Docker Compose**: Used for containerization of all services, ensuring consistent development, testing, and production environments, and simplifying service orchestration.
      * **Prometheus**: An open-source monitoring system that collects and stores time-series data, ideal for real-time operational analytics.
      * **Grafana**: A leading open-source platform for visualizing data from various sources, including Prometheus, through highly customizable and interactive dashboards.

## 4\. User Roles and Frontend Portal Usage

The system provides distinct frontend portals for different user roles, each offering tailored functionalities and access levels. All users access their respective portals through a unified login process, ensuring a consistent user experience while maintaining robust security.

### 4.1. Citizen Portal Usage

The Citizen Portal is designed for public users to interact with available services and manage their personal information.

  * **Access**: Citizens access this portal after successful registration and login.
  * **Key Functionalities**:
      * **Service Browse**: Upon logging in, citizens are presented with a list or catalog of available public services. They can typically search, filter, and view details about each service, including its description, requirements, and associated department/association.
      * **Request Submission**: For services requiring access, citizens can initiate a request. This usually involves filling out a form with necessary information, which is then submitted for approval by a Grantee or Administrator.
      * **Request and Grant Tracking**: Citizens can monitor the real-time status of their submitted service requests (e.g., "Pending," "Approved," "Rejected"). Once a request is approved, they can view details of the granted access (e.g., `grant_id`, `expires_at`, `is_active`) and, if applicable, directly access the service sessions.
      * **Profile Management**: Citizens have a dedicated section to view and update their personal profile information, including contact details and associated departments/associations.
      * **Service Session Access**: For services that require an active session (e.g., an API endpoint), the system provides a mechanism for the citizen to initiate and use the service based on their active grants.

### 4.2. Administrator Portal Usage

The Administrator Portal provides comprehensive management capabilities for departmental administrators.

  * **Access**: Accessible to users with Administrator privileges after login.
  * **Key Functionalities**:
      * **User Management**: Administrators can view and manage citizens and grantees associated with their assigned departments or associations. This includes creating new user accounts, updating existing profiles, or deactivating accounts.
      * **Department and Association Management**: Administrators are able to create, view, edit, and manage departments and their associated entities. This organizational structure is fundamental to how services and permissions are organized.
      * **Public Service Management**: Administrators can define and manage public services within their purview. This involves setting service details (name, description, URL), configuring visibility (e.g., public or restricted), and specifying allowed HTTP methods (GET, POST, PUT, DELETE).
      * **Request Review and Granting**: Administrators can review incoming service requests from citizens. They have the authority to approve or reject these requests and to issue access grants. When granting access, they can define the validity period and other conditions.
      * **Permission Configuration**: A critical function is the ability to configure granular service permissions. Administrators can set access rules based on citizen roles, specific departments, or associations, and even implement time-based access restrictions.
      * **System Log Viewing**: Administrators can access system activity logs filtered by relevant criteria (e.g., citizen, service, department) to monitor interactions and troubleshoot issues.

### 4.3. Grantee Portal Usage

The Grantee Portal focuses on managing access for services linked to specific associations.

  * **Access**: Accessible to users designated as Grantees after login.
  * **Key Functionalities**:
      * **Citizen Management**: Grantees can manage citizens who are affiliated with their assigned association, often involving reviewing their profiles and ensuring compliance with service requirements.
      * **Service Request Processing**: Similar to administrators, grantees review and process service requests related to the public services managed by their association. They are responsible for making decisions on access requests.
      * **Grant Issuance and Management**: Grantees issue and manage access grants for services under their association's domain. This includes setting the terms of the grant and revoking access when necessary.
      * **Service-Specific Permission Configuration**: Grantees can configure permissions specifically for the services associated with their entity, ensuring that access rules align with their operational needs.
      * **Activity Log Review**: Grantees can view activity logs pertinent to the citizens and services they manage, aiding in auditing and operational oversight.

### 4.4. Site Manager Portal Usage

The Site Manager Portal provides the highest level of administrative control, overseeing the entire system.

  * **Access**: Reserved for top-level administrators with full system oversight, accessible after login.
  * **Key Functionalities**:
      * **Comprehensive User Management**: Site Managers have the ability to manage all types of users across the entire system, including citizens, administrators, and grantees, irrespective of department or association. This includes account creation, modification, and deactivation.
      * **Global Department and Association Control**: Full control over creating, modifying, and deleting any department and association within the system, setting the foundational organizational structure.
      * **Universal Public Service Management**: Site Managers can manage all public services available in the system, configuring global visibility, restrictions, and API methods.
      * **System-wide Request and Grant Oversight**: Site Managers can view, approve, or reject any service request and manage any grant issued within the system.
      * **Full Permission System Management**: They have complete authority to define and modify all permission rules and access policies across the entire platform.
      * **Centralized Logging and Monitoring**: Access to all system activity logs and the ability to configure monitoring settings (e.g., Prometheus targets in `prometheus.yml` and Grafana dashboards via `datasources.yml`) to ensure the system's operational health and security.
      * **System Settings**: Site Managers can access and modify global system settings that affect the behavior and policies of the entire Centralized Access Management Gateway.

## 5\. Core Functionalities

  * **User Management**: Registration, login, and profile management for all user types (Citizen, Site Manager, Administrator, Grantee). Authentication is handled via JWT.
  * **Department and Association Management**: Creation, viewing, and modification of government departments and their associated entities.
  * **Public Service Management**: Defining and managing public services, including their accessibility, associated grantees, and allowed interaction methods (GET, POST, PATCH, DELETE).
  * **Important Note on Service Availability**: After a new service is successfully registered or modified in the Core Access Management backend, it will become accessible through the Central Gateway only after a **reboot of the Central Gateway**. It is recommended that a gateway reboot be undertaken once every day to ensure all newly registered services are discoverable and operational.
  * **Request and Grant Workflow**: Citizens can request services, and authorized grantees or administrators can approve or reject these requests, issuing grants that define access validity periods.
  * **Permission System**: A granular permission system allows administrators and grantees to define who can access specific services based on various criteria (citizen, department, association, service, time-based).
  * **System Logging**: Comprehensive logging of user activities and system interactions for auditing and monitoring purposes.
  * **API Gateway Integration**: The GoLang gateway centralizes API access, handles authentication, applies rate limiting and circuit breaking, and injects necessary headers for seamless communication between frontend and backend services.

## 6\. Setup and Deployment

The project employs Docker and Docker Compose to simplify the setup and deployment process, ensuring all components are easily containerized and orchestrated.

To set up the project locally:

1.  **Prerequisites**: Ensure that Docker and Docker Compose are installed on your system.
2.  **Navigate to Project Root**: Open your terminal or command prompt and navigate to the root directory of the project, which contains the `docker-compose.yml` file.
3.  **Launch Services**: Execute the command `docker-compose up --build`.
      * The `--build` flag ensures that fresh Docker images are built for all services (backend, frontend, gateway) based on their respective Dockerfiles. If images already exist and you haven't made changes to the Dockerfiles or dependencies, you can omit `--build` for faster startup (`docker-compose up`).
      * This command will initiate the startup sequence for all defined services: the PostgreSQL database, the Django backend, the GoLang gateway, the Next.js frontend, and the monitoring tools (Prometheus and Grafana).
      * Docker Compose will manage the network configuration, volume mounting for persistent data (e.g., PostgreSQL data), and ensure services start in the correct order.

Upon successful execution, the frontend application will be accessible via a web browser (typically at `http://localhost:3001` or a configured port), and the backend APIs, gateway, database, and monitoring tools will be running in the background.

**NB: Note that the system is not be used until all the docker containers are running**
**NB: The default Manager Account credentials are the following:**
    - ManagerUserName=A3R0
    - ManagerPassword=12345678
    - Email=null@gmail.com
    - Password=12345678
**NB: FOR NEWLY REGISTERED SERVICES TO BE INCOPERATED IN THE SYSTEM THE GATEWAY HAS TO ME REBOOTED, AS SUCH I RECOMMEND THAT ALL REBOOTS TAKE PLACE AT MIDNIGHT**

### 6.1. Grafana Instructions

Grafana is included in the `docker-compose.yml` setup and configured to automatically discover the Prometheus data source.

**Accessing Grafana:**

1.  Once `docker-compose up` is successfully run, Grafana should be accessible in your web browser, typically at `http://localhost:3000` (or the port mapped in your `docker-compose.yml` for Grafana).
2.  The default Grafana login credentials are `admin` for username and `bsrvnt` for password. You will likely be prompted to change the password on first login.

**Pre-configured Data Source:**

The `grafana/datasources.yml` file defines Prometheus as a data source for Grafana:

```yaml
# grafana/datasources.yml
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    url: http://prometheus:9090 # 'prometheus' is the service name in docker-compose.yml
    access: proxy
    isDefault: true
    version: 1
    editable: true
```

  * This configuration tells Grafana to connect to a Prometheus instance running at `http://prometheus:9090`. The `prometheus` hostname resolves to the Prometheus container within the Docker network.
  * The `isDefault: true` setting ensures that Prometheus is automatically selected as the default data source when creating new dashboards or panels.

**Importing Recommended Dashboards:**

To enhance your monitoring capabilities, you can import the following pre-built Grafana dashboards:

1.  **Django Application Metrics** (ID: 17658)

      * **Purpose**: Provides comprehensive metrics for Django applications, including HTTP requests, database queries, and other key performance indicators.
      * **Instructions**:
        1.  In Grafana, click on the Dashboards icon (four squares) in the left sidebar, then select "Import".
        2.  In the "Import via grafana.com" field, enter `17658`.
        3.  Click "Load".
        4.  Select "Prometheus" as the data source when prompted.
        5.  Click "Import".
      * **Source**: [https://grafana.com/grafana/dashboards/17658-django/](https://grafana.com/grafana/dashboards/17658-django/)

2.  **Django Prometheus Dashboard** (ID: 7996)

      * **Purpose**: A general dashboard for Django applications that are exposing metrics via `django-prometheus`, focusing on requests, database, cache, and other Django-specific metrics.
      * **Instructions**:
        1.  In Grafana, click on the Dashboards icon (four squares) in the left sidebar, then select "Import".
        2.  In the "Import via grafana.com" field, enter `7996`.
        3.  Click "Load".
        4.  Select "Prometheus" as the data source when prompted.
        5.  Click "Import".
      * **Source**: [https://grafana.com/grafana/dashboards/7996-django-prometheus/](https://grafana.com/grafana/dashboards/7996-django-prometheus/)

3.  **Go Processes Overview** (ID: 6671)

      * **Purpose**: Monitors key metrics for Go applications, such as goroutines, memory usage, garbage collection, and CPU utilization, which are crucial for observing the Central Gateway's health.
      * **Instructions**:
        1.  In Grafana, click on the Dashboards icon (four squares) in the left sidebar, then select "Import".
        2.  In the "Import via grafana.com" field, enter `6671`.
        3.  Click "Load".
        4.  Select "Prometheus" as the data source when prompted.
        5.  Click "Import".
      * **Source**: [https://grafana.com/grafana/dashboards/6671-go-processes/](https://grafana.com/grafana/dashboards/6671-go-processes/)

4.  **Django Requests Overview** (ID: 17616)

      * **Purpose**: Provides a high-level overview of Django application requests, offering insights into request rates, latencies, and response codes, which helps in identifying performance bottlenecks.
      * **Instructions**:
        1.  In Grafana, click on the Dashboards icon (four squares) in the left sidebar, then select "Import".
        2.  In the "Import via grafana.com" field, enter `17616`.
        3.  Click "Load".
        4.  Select "Prometheus" as the data source when prompted.
        5.  Click "Import".
      * **Source**: [https://grafana.com/grafana/dashboards/17616-django-requests-overview/](https://grafana.com/grafana/dashboards/17616-django-requests-overview/)

After importing, these dashboards will appear under the "Dashboards" section in Grafana, allowing you to monitor the various components of the Centralized Access Management Gateway effectively.

## 7\. Further Development and Improvements

To continuously enhance the Centralized Access Management Gateway, the following areas are recommended for future development:

  * **Enhanced Frontend Features**: Implement advanced user experience features such as real-time notifications for request status changes, more sophisticated search and filtering options for services and users, and personalized dashboards for each user role to highlight relevant information and actions.
  * **More Granular Permissions**: Develop an even more fine-grained permission system, allowing administrators to define access rules at the level of individual API endpoints, specific data fields, or even based on user attributes beyond basic roles.
  * **Detailed Audit Trails**: Implement a robust and immutable audit trail system that captures every critical action within the platform (e.g., user logins, data modifications, grant approvals/rejections) for regulatory compliance and enhanced security.
  * **Improved Error Handling and Resilience**: Introduce more comprehensive global error handling strategies, implement circuit breakers and retries for inter-service communication, and design for graceful degradation to ensure high availability and reliability.
  * **Advanced Security Enhancements**: Conduct regular security audits, implement stricter input validation across all interfaces, consider integrating multi-factor authentication (MFA) for all administrative roles, and explore vulnerability scanning tools.
  * **Scalability Optimizations**: Optimize database queries and schema, introduce caching mechanisms at various layers (e.g., Redis for API responses), and explore options for horizontal scaling or further decomposition into microservices as the system grows.
  * **Automated Testing Suite**: Expand the existing test coverage by developing a comprehensive suite of automated tests, including unit tests, integration tests for service interactions, and end-to-end tests for critical user flows, ensuring system stability and preventing regressions.

## 8\. Code Snippets and Explanations


The project is architecturally divided into three main components:

1.  A **Django (Python) Backend** that serves as the central management system or "control plane." It handles the database, user roles, service definitions, permissions, and logging.
2.  A **Go (Golang) Gateway** that acts as the high-performance reverse proxy. It is the public-facing entry point that processes all incoming user requests, consults the Django backend for rules, and forwards traffic to the appropriate downstream service.
3.  A **Nextjs Frontend App** that acts as the user's way of interacting with the system

**NB** : I shall only explain two
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
This guideline serves as a foundational document for understanding, developing, and maintaining the Centralized Access Management Gateway project, providing a clear roadmap for its functionality and future evolution.