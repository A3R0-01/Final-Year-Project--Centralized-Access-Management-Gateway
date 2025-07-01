**Project Summary – Goal of the Project**

The primary goal of the project titled **"Development of a Centralized Gateway for Access Management of Decentralized Government Platforms/Services"** is to design and implement a unified digital platform that serves as a **single point of access** to various decentralized government services in Zimbabwe. This centralized gateway aims to **simplify user authentication, authorization, and service delivery**, thereby eliminating the inefficiencies, redundancies, and fragmentation associated with the current siloed systems across government departments.

By consolidating access through a central API gateway, the system intends to:

* Streamline citizen, third-party, and government personnel interactions with multiple government services.
* Improve efficiency, transparency, and scalability of public service delivery.
* Enhance user experience by reducing the need for physical visits and duplicate registrations.
* Provide real-time monitoring, security, and future-proof integration with existing and legacy government systems.

### **Service**

A **Service** (technically a **PublicService**) represents a **government digital service or platform** that citizens can interact with through the centralized gateway.

#### 🔹 Key Features:

* **Title & Description**: Name and details about the service (e.g., “Apply for National ID”).
* **MachineName**: A unique system identifier for integration purposes.
* **Email & URL**: Contact and endpoint for the service.
* **Association**: The service belongs to a specific **Association**, which groups services under a **Department**.
* **Grantees**: One or more **Grantees** are assigned to manage and monitor access to the service.
* **Methods**: Allowed HTTP methods (e.g., `GET`, `POST`, `PATCH`) for accessing the service.
* **Restricted**: A flag indicating whether the service requires permission or a grant to be accessed.
* **Visibility**: Determines if the service is public or hidden from citizen view.

#### 🔹 Purpose:

* It acts as a **proxy or entry point** for external government APIs or systems.
* Handles **access control**, logging, and session tracking through the gateway.

---

So in short, a **Service** is the digital representation of an actual government functionality, and the system ensures **controlled, trackable, and secure access** to it.

Here’s a **brief explanation** of each of the entities in the centralized access management system:

---

### **1. Departments**

* A **Department** represents a **government entity or ministry**.
* It has fields like `Title`, `Email`, `Telephone`, `Website`, and is managed by one **Administrator**.
* Each department is associated with one or more **Associations**.

---

### **2. Associations**

* An **Association** acts as a **sub-entity under a department**.
* It contains metadata such as `Title`, `Email`, `Website`, and belongs to one `Department`.
* Each **Association** is linked to one or more **Public Services** and has **Grantees** managing its services.

---

### **3. Administrators**

* An **Administrator** is a privileged user responsible for managing a **Department**.
* They can oversee **Grantees**, create **Associations**, and control **Grants and Permissions** within their scope.
* They are linked to a **Citizen** account and have a limit on how many Grantees they can manage.

---

### **4. Grantees**

* A **Grantee** is assigned by an Administrator to manage services under a specific **Association**.
* Grantees have access to **Requests**, **Grants**, and **Permissions** related to the services they manage.
* They are also tied to a **Citizen** profile and must belong to the same department as their administrator.

---

### **5. Grants**

* A **Grant** is a record of **approval or denial** for a citizen’s request to access a restricted service.
* It includes a `Request`, `Grantee`, `Message`, `StartDate`, `EndDate`, and `Decline` status.
* Grants determine whether a citizen currently has access to a service (`Granted` flag checks validity based on time and status).

---

### **6. Permissions**

* **Permissions** define **access rights** granted to citizens for specific operations or services.
* They include metadata like `Name`, `Description`, applicable `Citizens`, `StartTime`, and `EndTime`.
* A permission is considered active (`permission_open`) only if the current time falls within its validity window.

---
