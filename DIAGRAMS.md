# 📊 TARANG Platform Diagrams

## Table of Contents
1. [Process Flow Diagram](#process-flow-diagram)
2. [Use Case Diagram](#use-case-diagram)
3. [Architecture Diagram](#architecture-diagram)
4. [Data Flow Diagram](#data-flow-diagram)
5. [Deployment Diagram](#deployment-diagram)

---

## Process Flow Diagram

### Complete Screening & Care Process Flow

```mermaid
flowchart TB
    Start([User Visits Platform]) --> Login{User<br/>Authenticated?}
    
    Login -->|No| Register[Register Account]
    Register --> SelectRole[Select Role:<br/>Parent/Clinician/Admin]
    SelectRole --> CreateProfile[Complete Profile]
    CreateProfile --> Login
    
    Login -->|Yes| Dashboard[User Dashboard]
    
    Dashboard --> RoleCheck{User Role?}
    
    %% Parent Flow
    RoleCheck -->|Parent| ParentDash[Parent Dashboard]
    ParentDash --> InitScreen[Initiate Screening]
    InitScreen --> VideoStep[Step 1: Video Recording]
    VideoStep --> VideoCapture[Capture 30-60s Video]
    VideoCapture --> VideoProcess[AI Vision Analysis<br/>MediaPipe Processing]
    VideoProcess --> VideoMetrics[Extract Metrics:<br/>- Gaze patterns<br/>- Social engagement<br/>- Attention span]
    
    VideoMetrics --> QuestStep[Step 2: Questionnaire]
    QuestStep --> Questions[10 Behavioral Questions<br/>AQ-10 Standard]
    Questions --> QuestionScore[Calculate Q-Score]
    
    QuestionScore --> DataFusion[Multi-Modal Data Fusion]
    VideoMetrics --> DataFusion
    
    DataFusion --> MLAgent[Screening Agent<br/>ML Risk Assessment]
    MLAgent --> RiskCalc[Calculate Risk Score<br/>40% ML + 35% Vision<br/>+ 25% Questionnaire]
    
    RiskCalc --> DissonanceCheck{Check Data<br/>Dissonance}
    DissonanceCheck -->|High Conflict| FlagDissonance[Flag for Review]
    DissonanceCheck -->|Consistent| ProceedReport[Generate Report]
    FlagDissonance --> ProceedReport
    
    ProceedReport --> ClinicalAgent[Clinical Agent]
    ClinicalAgent --> GenPDF[Generate PDF Report]
    ClinicalAgent --> GenFHIR[Generate FHIR R4 Export]
    ClinicalAgent --> StoreDB[(Store in Database<br/>Encrypted PII)]
    
    GenPDF --> ParentView[Parent Views Report]
    ParentView --> RiskLevel{Risk Level?}
    
    RiskLevel -->|Low Risk| Monitoring[Continue Monitoring]
    RiskLevel -->|Medium Risk| Recommend[Recommend Assessment]
    RiskLevel -->|High Risk| UrgentRef[Urgent Referral]
    
    Recommend --> ScheduleAppt[Schedule Appointment]
    UrgentRef --> ScheduleAppt
    
    ScheduleAppt --> Community[Access Community<br/>Support Resources]
    Monitoring --> Community
    
    Community --> LongTerm[Longitudinal Tracking]
    
    %% Clinician Flow
    RoleCheck -->|Clinician| ClinicianDash[Clinician Dashboard]
    ClinicianDash --> ViewReports[View Patient Reports]
    ViewReports --> ReviewScreen[Review Screening Results]
    ReviewScreen --> ClinicAction{Clinical Decision}
    
    ClinicAction -->|Further Assessment| LiveSession[Schedule Live Session<br/>WebRTC Video]
    ClinicAction -->|Confirm Diagnosis| Treatment[Develop Treatment Plan]
    ClinicAction -->|No Concern| Discharge[Document & Discharge]
    
    LiveSession --> SessionAnalysis[Real-Time AI Analysis]
    SessionAnalysis --> SessionReport[Session Summary]
    SessionReport --> Treatment
    
    Treatment --> TherapyAgent[Therapy Agent<br/>Personalized Plan]
    TherapyAgent --> InterventionPlan[Create Intervention Plan]
    InterventionPlan --> TrackProgress[Track Progress Over Time]
    
    TrackProgress --> OutcomeAgent[Outcome Agent<br/>Trajectory Prediction]
    OutcomeAgent --> Efficacy[Analyze Intervention<br/>Efficacy]
    Efficacy --> AdjustPlan{Plan Effective?}
    
    AdjustPlan -->|No| ModifyPlan[Modify Intervention]
    ModifyPlan --> InterventionPlan
    AdjustPlan -->|Yes| ContinueCare[Continue Care]
    
    ContinueCare --> LongTerm
    
    %% Admin Flow
    RoleCheck -->|Admin| AdminDash[Admin Dashboard]
    AdminDash --> ManageOrg[Manage Organization]
    ManageOrg --> AddUsers[Add Clinicians/Staff]
    ManageOrg --> ViewAnalytics[View Analytics<br/>& Reports]
    ManageOrg --> SystemHealth[Monitor System Health]
    
    ViewAnalytics --> PopulationData[Population-Level Insights]
    SystemHealth --> Alerts[Configure Alerts]
    
    %% Background Processing
    StoreDB -.->|Async| CeleryWorker[Celery Worker<br/>Background Processing]
    CeleryWorker -.-> HeavyAI[Heavy AI Computations]
    CeleryWorker -.-> EmailNotif[Email Notifications]
    CeleryWorker -.-> DataBackup[Data Backup]
    
    LongTerm --> End([End])
    PopulationData --> End
    Alerts --> End
    
    style Start fill:#4CAF50,stroke:#2E7D32,stroke-width:3px,color:#fff
    style End fill:#F44336,stroke:#C62828,stroke-width:3px,color:#fff
    style MLAgent fill:#2196F3,stroke:#1565C0,stroke-width:2px,color:#fff
    style ClinicalAgent fill:#2196F3,stroke:#1565C0,stroke-width:2px,color:#fff
    style TherapyAgent fill:#2196F3,stroke:#1565C0,stroke-width:2px,color:#fff
    style OutcomeAgent fill:#2196F3,stroke:#1565C0,stroke-width:2px,color:#fff
    style CeleryWorker fill:#FF9800,stroke:#E65100,stroke-width:2px,color:#fff
    style StoreDB fill:#9C27B0,stroke:#6A1B9A,stroke-width:2px,color:#fff
```

---

## Use Case Diagram

### TARANG Platform Use Cases

```mermaid
graph TB
    subgraph Actors
        Parent([Parent/Guardian])
        Clinician([Clinician/Doctor])
        Admin([System Admin])
        System([AI System])
    end
    
    subgraph "Authentication & Authorization"
        UC1[Register Account]
        UC2[Login/Logout]
        UC3[Manage Profile]
        UC4[Reset Password]
    end
    
    subgraph "Screening & Assessment"
        UC5[Initiate Screening]
        UC6[Record Video]
        UC7[Complete Questionnaire]
        UC8[View Risk Score]
        UC9[Download Report]
        UC10[Export FHIR Data]
        UC11[Schedule Live Session]
        UC12[Conduct Video Assessment]
    end
    
    subgraph "Clinical Management"
        UC13[Review Patient Reports]
        UC14[Create Treatment Plan]
        UC15[Track Progress]
        UC16[Schedule Appointments]
        UC17[Generate Clinical Notes]
        UC18[Prescribe Interventions]
    end
    
    subgraph "Community & Support"
        UC19[Browse Community Posts]
        UC20[Create Post]
        UC21[Get AI Help]
        UC22[Access Resources]
        UC23[Connect with Parents]
    end
    
    subgraph "Administration"
        UC24[Manage Organizations]
        UC25[Add/Remove Users]
        UC26[View Analytics]
        UC27[Configure System]
        UC28[Monitor Health]
        UC29[Manage Centers]
    end
    
    subgraph "AI Processing"
        UC30[Analyze Video]
        UC31[Calculate Risk Score]
        UC32[Generate Report]
        UC33[Predict Trajectory]
        UC34[Moderate Content]
        UC35[Match Resources]
    end
    
    %% Parent Use Cases
    Parent --> UC1
    Parent --> UC2
    Parent --> UC3
    Parent --> UC4
    Parent --> UC5
    Parent --> UC6
    Parent --> UC7
    Parent --> UC8
    Parent --> UC9
    Parent --> UC10
    Parent --> UC16
    Parent --> UC19
    Parent --> UC20
    Parent --> UC21
    Parent --> UC22
    Parent --> UC23
    
    %% Clinician Use Cases
    Clinician --> UC2
    Clinician --> UC3
    Clinician --> UC11
    Clinician --> UC12
    Clinician --> UC13
    Clinician --> UC14
    Clinician --> UC15
    Clinician --> UC16
    Clinician --> UC17
    Clinician --> UC18
    Clinician --> UC19
    Clinician --> UC26
    
    %% Admin Use Cases
    Admin --> UC2
    Admin --> UC3
    Admin --> UC24
    Admin --> UC25
    Admin --> UC26
    Admin --> UC27
    Admin --> UC28
    Admin --> UC29
    
    %% System Use Cases
    System --> UC30
    System --> UC31
    System --> UC32
    System --> UC33
    System --> UC34
    System --> UC35
    
    %% Include Relationships
    UC5 -.->|includes| UC6
    UC5 -.->|includes| UC7
    UC6 -.->|includes| UC30
    UC7 -.->|includes| UC31
    UC8 -.->|includes| UC32
    UC20 -.->|includes| UC34
    UC21 -.->|includes| UC35
    UC15 -.->|includes| UC33
    
    %% Extend Relationships
    UC9 -.->|extends| UC8
    UC10 -.->|extends| UC8
    UC12 -.->|extends| UC13
    
    style Parent fill:#4CAF50,stroke:#2E7D32,stroke-width:3px,color:#fff
    style Clinician fill:#2196F3,stroke:#1565C0,stroke-width:3px,color:#fff
    style Admin fill:#F44336,stroke:#C62828,stroke-width:3px,color:#fff
    style System fill:#FF9800,stroke:#E65100,stroke-width:3px,color:#fff
```

---

## Architecture Diagram

### System Architecture - Multi-Layer Design

```mermaid
graph TB
    subgraph "Client Layer"
        Browser[Web Browser<br/>Desktop/Mobile]
        PWA[Progressive Web App]
    end
    
    subgraph "CDN & Edge"
        Vercel[Vercel Edge Network<br/>Global CDN]
        CloudFlare[CloudFlare<br/>DDoS Protection]
    end
    
    subgraph "Frontend Layer - Next.js 15"
        NextApp[Next.js Application]
        
        subgraph "Pages & Routes"
            Landing[Landing Page]
            Auth[Auth Pages<br/>Login/Register]
            Dashboard[Dashboards<br/>Parent/Clinician/Admin]
            Screening[Screening Interface]
            Reports[Report Viewer]
            Community[Community Portal]
            Clinical[Clinical Tools]
        end
        
        subgraph "Frontend Components"
            UI[UI Components<br/>Tailwind CSS]
            MediaPipe[MediaPipe Vision<br/>Client-side AI]
            WebRTC[WebRTC Client<br/>Video Streaming]
            Charts[Recharts<br/>Data Visualization]
        end
        
        subgraph "State Management"
            Zustand[Zustand Store]
            AuthContext[Auth Context<br/>JWT Management]
            ReactQuery[React Query<br/>Cache]
        end
    end
    
    subgraph "API Gateway Layer"
        APIGateway[FastAPI Gateway<br/>Port 8000]
        RateLimit[Rate Limiter<br/>SlowAPI]
        CORS[CORS Middleware]
        JWTAuth[JWT Authentication]
        InputValidation[Pydantic Validation]
    end
    
    subgraph "Application Layer - FastAPI"
        subgraph "API Endpoints"
            AuthAPI[Authentication API<br/>/auth/token]
            ScreeningAPI[Screening API<br/>/screening/process]
            ReportsAPI[Reports API<br/>/reports/*]
            CommunityAPI[Community API<br/>/community/*]
            ClinicalAPI[Clinical API<br/>/clinical/*]
            AnalyticsAPI[Analytics API<br/>/analytics/*]
            WSAPI[WebSocket API<br/>/ws/screening]
        end
        
        subgraph "Business Logic"
            SecurityModule[Security Module<br/>Password Hashing<br/>Token Generation]
            ValidationModule[Validation Module<br/>Input Sanitization]
            AuthorizationModule[Authorization<br/>RBAC Logic]
        end
    end
    
    subgraph "AI Agent Layer"
        ScreeningAgent[Screening Agent<br/>ML Risk Assessment<br/>Random Forest]
        ClinicalAgent[Clinical Agent<br/>Report Generation<br/>FHIR R4 Export]
        OutcomeAgent[Outcome Agent<br/>Trajectory Prediction<br/>Intervention Analysis]
        SocialAgent[Social Agent<br/>Content Moderation<br/>Resource Matching]
        TherapyAgent[Therapy Agent<br/>Personalized Plans]
        ClinicianAgent[Clinician Agent<br/>Tele-Health Support]
        SREAgent[SRE Agent<br/>System Monitoring]
    end
    
    subgraph "Data Processing Layer"
        subgraph "Async Workers"
            Celery[Celery Distributed Task Queue]
            Worker1[Worker 1<br/>Video Processing]
            Worker2[Worker 2<br/>ML Inference]
            Worker3[Worker 3<br/>Report Generation]
        end
        
        subgraph "Processing Services"
            VideoProc[Video Processing<br/>Frame Extraction]
            MLInference[ML Inference<br/>Scikit-learn]
            PDFGen[PDF Generation<br/>ReportLab]
            FHIRMap[FHIR Mapper<br/>HL7 R4]
        end
    end
    
    subgraph "Data Layer"
        subgraph "Primary Database"
            Postgres[(PostgreSQL 15<br/>Neon Cloud)]
            
            subgraph "Tables"
                Users[Users<br/>Encrypted PII]
                Patients[Patients<br/>AES-256 Encrypted]
                Sessions[Screening Sessions]
                Reports[Reports]
                Community[Community Posts]
                Progress[Therapy Progress]
                Orgs[Organizations]
            end
        end
        
        subgraph "Cache & Queue"
            Redis[(Redis 7<br/>Upstash)]
            TaskQueue[Task Queue]
            SessionCache[Session Cache]
            APICache[API Response Cache]
        end
        
        subgraph "File Storage"
            S3[Object Storage<br/>S3/CloudFlare R2<br/>Video Files]
            LocalFS[Local Filesystem<br/>Temp Processing]
        end
    end
    
    subgraph "External Services"
        EmailService[Email Service<br/>SendGrid/SES]
        SMSService[SMS Service<br/>Twilio]
        MonitoringService[Monitoring<br/>Sentry/DataDog]
        LogService[Logging<br/>CloudWatch/LogTail]
    end
    
    subgraph "Security Layer"
        SSL[SSL/TLS Encryption<br/>Let's Encrypt]
        Firewall[Web Application Firewall]
        DDoS[DDoS Protection]
        Encryption[AES-256 Encryption<br/>PII Data]
        Audit[Audit Logging]
    end
    
    %% Connections - Client to Frontend
    Browser --> CloudFlare
    PWA --> CloudFlare
    CloudFlare --> Vercel
    Vercel --> NextApp
    
    %% Frontend Internal
    NextApp --> Landing
    NextApp --> Auth
    NextApp --> Dashboard
    NextApp --> Screening
    NextApp --> Reports
    NextApp --> Community
    NextApp --> Clinical
    
    Landing --> UI
    Screening --> MediaPipe
    Screening --> WebRTC
    Reports --> Charts
    
    Dashboard --> Zustand
    Auth --> AuthContext
    
    %% Frontend to Backend
    NextApp --> APIGateway
    WebRTC --> WSAPI
    
    %% API Gateway
    APIGateway --> RateLimit
    RateLimit --> CORS
    CORS --> JWTAuth
    JWTAuth --> InputValidation
    
    %% API Gateway to Endpoints
    InputValidation --> AuthAPI
    InputValidation --> ScreeningAPI
    InputValidation --> ReportsAPI
    InputValidation --> CommunityAPI
    InputValidation --> ClinicalAPI
    InputValidation --> AnalyticsAPI
    InputValidation --> WSAPI
    
    %% Business Logic
    AuthAPI --> SecurityModule
    ScreeningAPI --> ValidationModule
    ReportsAPI --> AuthorizationModule
    
    %% API to Agents
    ScreeningAPI --> ScreeningAgent
    ReportsAPI --> ClinicalAgent
    ClinicalAPI --> OutcomeAgent
    CommunityAPI --> SocialAgent
    ClinicalAPI --> TherapyAgent
    ClinicalAPI --> ClinicianAgent
    AnalyticsAPI --> SREAgent
    
    %% Agents to Workers
    ScreeningAgent -.->|Async| Celery
    ClinicalAgent -.->|Async| Celery
    
    Celery --> Worker1
    Celery --> Worker2
    Celery --> Worker3
    
    Worker1 --> VideoProc
    Worker2 --> MLInference
    Worker3 --> PDFGen
    ClinicalAgent --> FHIRMap
    
    %% Workers to Data
    ScreeningAgent --> Postgres
    ClinicalAgent --> Postgres
    OutcomeAgent --> Postgres
    SocialAgent --> Postgres
    
    Postgres --> Users
    Postgres --> Patients
    Postgres --> Sessions
    Postgres --> Reports
    Postgres --> Community
    Postgres --> Progress
    Postgres --> Orgs
    
    %% Cache Layer
    AuthAPI --> Redis
    ScreeningAPI --> Redis
    Celery --> TaskQueue
    TaskQueue --> Redis
    SessionCache --> Redis
    APICache --> Redis
    
    %% File Storage
    VideoProc --> S3
    Worker1 --> LocalFS
    
    %% External Services
    ClinicalAgent --> EmailService
    TherapyAgent --> SMSService
    APIGateway --> MonitoringService
    APIGateway --> LogService
    
    %% Security
    APIGateway --> SSL
    CloudFlare --> Firewall
    CloudFlare --> DDoS
    Postgres --> Encryption
    APIGateway --> Audit
    
    %% Styling
    style Browser fill:#4CAF50,stroke:#2E7D32,stroke-width:2px,color:#fff
    style APIGateway fill:#2196F3,stroke:#1565C0,stroke-width:3px,color:#fff
    style Postgres fill:#9C27B0,stroke:#6A1B9A,stroke-width:3px,color:#fff
    style Redis fill:#F44336,stroke:#C62828,stroke-width:3px,color:#fff
    style Celery fill:#FF9800,stroke:#E65100,stroke-width:3px,color:#fff
    
    style ScreeningAgent fill:#00BCD4,stroke:#006064,stroke-width:2px,color:#fff
    style ClinicalAgent fill:#00BCD4,stroke:#006064,stroke-width:2px,color:#fff
    style OutcomeAgent fill:#00BCD4,stroke:#006064,stroke-width:2px,color:#fff
    style SocialAgent fill:#00BCD4,stroke:#006064,stroke-width:2px,color:#fff
    style TherapyAgent fill:#00BCD4,stroke:#006064,stroke-width:2px,color:#fff
```

---

## Data Flow Diagram

### Level 0 - Context Diagram

```mermaid
graph LR
    Parent([Parent/Guardian]) -->|Screening Request| TARANG[TARANG<br/>AI Care Platform]
    Clinician([Clinician]) -->|Clinical Review| TARANG
    Admin([Administrator]) -->|System Management| TARANG
    
    TARANG -->|Risk Assessment| Parent
    TARANG -->|Clinical Report| Clinician
    TARANG -->|Analytics| Admin
    
    TARANG -->|Store Data| Database[(Healthcare<br/>Database)]
    TARANG -->|Fetch Resources| ExtAPI[External<br/>Healthcare APIs]
    TARANG -->|Send Notifications| Email[Email/SMS<br/>Service]
    
    style TARANG fill:#2196F3,stroke:#1565C0,stroke-width:4px,color:#fff
    style Database fill:#9C27B0,stroke:#6A1B9A,stroke-width:2px,color:#fff
```

### Level 1 - System Processes

```mermaid
graph TB
    subgraph Inputs
        VideoInput[Video Recording]
        QuestionInput[Questionnaire Responses]
        ClinicianInput[Clinician Notes]
        ParentInput[Parent Observations]
    end
    
    subgraph "Process 1: Data Collection"
        P1[Capture & Validate<br/>Screening Data]
    end
    
    subgraph "Process 2: AI Analysis"
        P2A[Vision Analysis<br/>MediaPipe]
        P2B[ML Risk Assessment<br/>Scikit-learn]
        P2C[Data Fusion<br/>Multi-Modal Integration]
    end
    
    subgraph "Process 3: Clinical Processing"
        P3A[Generate Report<br/>PDF/FHIR]
        P3B[Clinical Recommendations]
        P3C[Intervention Planning]
    end
    
    subgraph "Process 4: Storage & Retrieval"
        P4[Store/Retrieve<br/>Patient Records]
    end
    
    subgraph "Process 5: Community & Support"
        P5[Community Management<br/>Moderation & Resources]
    end
    
    subgraph Outputs
        RiskScore[Risk Score Report]
        ClinicalReport[Clinical Report PDF]
        FHIRExport[FHIR R4 Export]
        Recommendations[Treatment Plan]
        CommunitySupport[Support Resources]
    end
    
    subgraph Storage
        DB[(Encrypted<br/>Database)]
        Cache[(Redis<br/>Cache)]
        Files[(File<br/>Storage)]
    end
    
    VideoInput --> P1
    QuestionInput --> P1
    ParentInput --> P1
    
    P1 --> P2A
    P1 --> P2B
    P2A --> P2C
    P2B --> P2C
    
    P2C --> P3A
    P2C --> P3B
    P3B --> P3C
    
    P3A --> P4
    P3B --> P4
    P3C --> P4
    
    ClinicianInput --> P3C
    
    P4 --> DB
    P4 --> Cache
    P4 --> Files
    
    P5 --> CommunitySupport
    
    P2C --> RiskScore
    P3A --> ClinicalReport
    P3A --> FHIRExport
    P3C --> Recommendations
    
    DB --> P3A
    DB --> P5
    Cache --> P2B
    Files --> P2A
    
    style P1 fill:#4CAF50,stroke:#2E7D32,stroke-width:2px,color:#fff
    style P2C fill:#2196F3,stroke:#1565C0,stroke-width:2px,color:#fff
    style P3A fill:#FF9800,stroke:#E65100,stroke-width:2px,color:#fff
    style P4 fill:#9C27B0,stroke:#6A1B9A,stroke-width:2px,color:#fff
    style P5 fill:#00BCD4,stroke:#006064,stroke-width:2px,color:#fff
```

---

## Deployment Diagram

### Production Deployment Architecture

```mermaid
graph TB
    subgraph "User Devices"
        Desktop[Desktop Browser<br/>Chrome/Firefox/Safari]
        Mobile[Mobile Browser<br/>iOS/Android]
        Tablet[Tablet<br/>iPad/Android]
    end
    
    subgraph "Edge & CDN Layer"
        CF[CloudFlare<br/>DNS & DDoS<br/>149+ Data Centers]
        VercelEdge[Vercel Edge Network<br/>Global CDN<br/>Static Assets]
    end
    
    subgraph "Frontend Hosting - Vercel"
        VercelUS[US East<br/>Primary Region]
        VercelEU[EU West<br/>Secondary]
        VercelAsia[Asia Pacific<br/>Tertiary]
        
        VercelUS --- VercelEU
        VercelEU --- VercelAsia
    end
    
    subgraph "Backend Hosting - Render"
        RenderAPI[API Server<br/>Docker Container<br/>FastAPI + Uvicorn<br/>Oregon/Frankfurt]
        
        RenderWorker[Celery Worker<br/>Background Jobs<br/>Same Region]
    end
    
    subgraph "Database Layer - Neon"
        NeonPrimary[(Primary Database<br/>PostgreSQL 15<br/>Singapore/Oregon)]
        NeonReplica[(Read Replica<br/>Auto-scaling<br/>Load Balancing)]
        
        NeonPrimary -.->|Replication| NeonReplica
    end
    
    subgraph "Cache Layer - Upstash"
        UpstashRedis[(Redis 7<br/>Global Cache<br/>Multi-Region)]
    end
    
    subgraph "Monitoring & Logging"
        Sentry[Sentry<br/>Error Tracking]
        LogTail[LogTail<br/>Log Aggregation]
        UptimeRobot[UptimeRobot<br/>Health Monitoring]
    end
    
    subgraph "External Services"
        SendGrid[SendGrid<br/>Email Service]
        Twilio[Twilio<br/>SMS Service]
        S3Compatible[CloudFlare R2<br/>Video Storage<br/>S3 Compatible]
    end
    
    subgraph "Security Services"
        LetsEncrypt[Let's Encrypt<br/>SSL Certificates]
        Auth0Optional[Auth0<br/>Optional SSO]
    end
    
    %% User Connections
    Desktop --> CF
    Mobile --> CF
    Tablet --> CF
    
    %% CDN Layer
    CF --> VercelEdge
    VercelEdge --> VercelUS
    VercelEdge --> VercelEU
    VercelEdge --> VercelAsia
    
    %% Frontend to Backend
    VercelUS --> RenderAPI
    VercelEU --> RenderAPI
    VercelAsia --> RenderAPI
    
    %% Backend to Data
    RenderAPI --> NeonPrimary
    RenderAPI --> NeonReplica
    RenderAPI --> UpstashRedis
    RenderWorker --> NeonPrimary
    RenderWorker --> UpstashRedis
    
    %% Backend to External
    RenderAPI --> SendGrid
    RenderAPI --> Twilio
    RenderAPI --> S3Compatible
    RenderWorker --> S3Compatible
    
    %% Monitoring
    RenderAPI --> Sentry
    RenderAPI --> LogTail
    VercelUS --> Sentry
    UptimeRobot --> RenderAPI
    
    %% Security
    CF --> LetsEncrypt
    RenderAPI --> Auth0Optional
    
    %% Async Processing
    RenderAPI -.->|Task Queue| RenderWorker
    
    %% Annotations
    Desktop ---|HTTPS/WSS| CF
    CF ---|HTTP/3 QUIC| VercelEdge
    VercelUS ---|REST API| RenderAPI
    RenderAPI ---|SQL/TLS| NeonPrimary
    RenderAPI ---|Redis Protocol| UpstashRedis
    
    style CF fill:#F48120,stroke:#E65100,stroke-width:3px,color:#fff
    style RenderAPI fill:#4A90E2,stroke:#1565C0,stroke-width:3px,color:#fff
    style NeonPrimary fill:#00E8A3,stroke:#00695C,stroke-width:3px,color:#000
    style UpstashRedis fill:#00E676,stroke:#00C853,stroke-width:3px,color:#000
    style VercelUS fill:#000,stroke:#000,stroke-width:3px,color:#fff
    style RenderWorker fill:#FF6B6B,stroke:#C62828,stroke-width:2px,color:#fff
```

### Deployment Configuration

```mermaid
graph LR
    subgraph "Environment Variables"
        subgraph "Frontend (Vercel)"
            FE1[NEXT_PUBLIC_API_URL]
        end
        
        subgraph "Backend (Render)"
            BE1[SECRET_KEY<br/>32-byte AES key]
            BE2[JWT_SECRET<br/>64-char token]
            BE3[DATABASE_URL<br/>PostgreSQL connection]
            BE4[REDIS_URL<br/>Cache connection]
            BE5[ALLOWED_ORIGINS<br/>CORS config]
            BE6[ENVIRONMENT<br/>production]
        end
    end
    
    subgraph "Health Checks"
        HC1[Frontend: /_next/healthcheck<br/>Every 30s]
        HC2[Backend: /health<br/>Every 30s]
        HC3[Database: pg_isready<br/>Every 10s]
        HC4[Redis: PING<br/>Every 10s]
    end
    
    subgraph "Auto-Scaling"
        AS1[Vercel: Auto<br/>Unlimited requests]
        AS2[Render Free: 1 instance<br/>Render Paid: 1-10 instances]
        AS3[Neon: Auto-scale<br/>0.25-4 CU]
        AS4[Upstash: Auto-scale<br/>Pay per request]
    end
    
    style BE1 fill:#F44336,stroke:#C62828,stroke-width:2px,color:#fff
    style BE2 fill:#F44336,stroke:#C62828,stroke-width:2px,color:#fff
    style BE3 fill:#2196F3,stroke:#1565C0,stroke-width:2px,color:#fff
    style BE4 fill:#4CAF50,stroke:#2E7D32,stroke-width:2px,color:#fff
```

---

## Network Topology

```mermaid
graph TB
    subgraph "Public Internet"
        Internet((Internet))
    end
    
    subgraph "DMZ - Demilitarized Zone"
        LoadBalancer[Load Balancer<br/>CloudFlare]
        WAF[Web Application Firewall<br/>Rate Limiting + DDoS]
    end
    
    subgraph "Application Zone"
        FrontendCluster[Frontend Cluster<br/>Vercel Edge<br/>Public Subnet]
        APICluster[API Cluster<br/>Render<br/>Private Subnet]
    end
    
    subgraph "Data Zone - Private Network"
        DatabaseCluster[(Database Cluster<br/>Neon PostgreSQL<br/>Private Subnet)]
        CacheCluster[(Cache Cluster<br/>Upstash Redis<br/>Private Subnet)]
    end
    
    subgraph "Management Zone"
        Monitoring[Monitoring<br/>Sentry + LogTail]
        Admin[Admin Console<br/>Restricted Access]
    end
    
    Internet --> LoadBalancer
    LoadBalancer --> WAF
    WAF --> FrontendCluster
    WAF --> APICluster
    
    FrontendCluster --> APICluster
    APICluster --> DatabaseCluster
    APICluster --> CacheCluster
    
    APICluster --> Monitoring
    DatabaseCluster --> Monitoring
    
    Admin -.->|VPN| APICluster
    Admin -.->|VPN| DatabaseCluster
    
    style Internet fill:#90CAF9,stroke:#1565C0,stroke-width:2px
    style WAF fill:#F44336,stroke:#C62828,stroke-width:3px,color:#fff
    style DatabaseCluster fill:#9C27B0,stroke:#6A1B9A,stroke-width:3px,color:#fff
```

---

## How to View These Diagrams

### Option 1: GitHub (Automatic Rendering)
- Push this file to GitHub
- GitHub automatically renders Mermaid diagrams

### Option 2: Mermaid Live Editor
1. Go to https://mermaid.live
2. Copy any diagram code
3. Paste into the editor
4. Export as PNG/SVG

### Option 3: VS Code
1. Install "Markdown Preview Mermaid Support" extension
2. Open this file
3. Press `Ctrl+Shift+V` (Windows) or `Cmd+Shift+V` (Mac)

### Option 4: Documentation Sites
- Works in: GitBook, Docusaurus, MkDocs, etc.
- Most modern documentation platforms support Mermaid

---

**Created for TARANG AI Care Platform**  
**Last Updated:** 2026-02-11  
**Diagram Format:** Mermaid.js
