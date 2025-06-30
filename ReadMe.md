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

## 1\. Project Overview

The Centralized Access Management Gateway is designed to provide a robust and secure system for managing user access to various public services. It aims to centralize user authentication, authorization, and service access requests, ensuring controlled and logged interactions within a multi-tiered administrative and citizen-facing environment. The system facilitates a streamlined process for citizens to request and gain access to services, while providing various levels of administrative control for government entities to manage these services and user permissions.

## 2\. System Architecture

The system is composed of several interconnected components, designed for modularity, scalability, and performance:

  * **Central Gateway (GoLang)**: This serves as the primary entry point for all service requests. Built with GoLang, it is optimized for high performance, handling authentication, authorization, and intelligent routing of requests to the appropriate backend services. It also integrates core functionalities for comprehensive logging and real-time metrics collection, acting as a crucial security and traffic management layer.
  * **Core Access Management (Django/Python)**: This component represents the robust backend API, developed using Django (Python). It is responsible for managing all core entities and business logic, including user profiles, departmental structures, organizational associations, a catalog of public services, service requests, and access grants. It interacts seamlessly with a PostgreSQL database to ensure data integrity and persistence.
  * **Frontend (Next.js/TypeScript)**: The user-facing interface of the system is a modern web application built with Next.js (React) and TypeScript. It offers distinct portals tailored for different user roles—Citizen, Site Manager, Administrator, and Grantee—providing intuitive interfaces for interacting with the system's functionalities.
  * **Monitoring (Prometheus & Grafana)**: For operational visibility and system health, the project integrates with Prometheus for collecting various system and application metrics, and Grafana for visualizing these metrics through interactive dashboards, enabling proactive monitoring and issue detection.

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

This guideline serves as a foundational document for understanding, developing, and maintaining the Centralized Access Management Gateway project, providing a clear roadmap for its functionality and future evolution.