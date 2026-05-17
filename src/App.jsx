import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Layout, 
  Server, 
  Database, 
  MessageSquare, 
  Cpu, 
  Globe, 
  Shield, 
  Zap, 
  BookOpen, 
  Layers,
  Search,
  Bell,
  User,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Activity,
  HardDrive,
  Cloud,
  Plus,
  Trash2,
  Edit3,
  Save,
  X,
  Download,
  Upload,
  RefreshCw,
  Check,
  ExternalLink
} from 'lucide-react';
import SystemDesignCanvas from './components/SystemDesignCanvas';
import './App.css';

// ----------------------------------------------------
// ICON MAP FOR DYNAMIC RESOLUTION & LOCALSTORAGE
// ----------------------------------------------------
const IconMap = {
  BookOpen,
  Layers,
  Layout,
  Globe,
  Sparkles,
  Database,
  MessageSquare,
  Shield,
  Server,
  Zap,
  Activity,
  HardDrive,
  Cloud,
  Cpu,
  ArrowRight,
  Plus,
  Trash2,
  Edit3,
  Save,
  X,
  Download,
  Upload,
  RefreshCw,
  Check,
  ExternalLink
};

const NoteIcon = ({ name, size = 24, color = 'currentColor', ...props }) => {
  const IconComp = IconMap[name] || BookOpen;
  return <IconComp size={size} color={color} {...props} />;
};

// ----------------------------------------------------
// DEFAULT DEEP-DIVE NOTES (HIGH-FIDELITY BASELINE)
// ----------------------------------------------------
const defaultFundamentals = [
  {
    id: 'fund-latency-throughput',
    title: 'Latency vs Throughput',
    iconName: 'Activity',
    color: '#6366f1',
    content: 'Understanding the core trade-off between speed (response time) and volume (system capacity).',
    tags: ['SLA/SLO', 'P99 Latency', 'QPS/RPS'],
    deepDive: `Latency is the time taken for a single request to travel from the client to the server, undergo processing, and return. It is typically measured in milliseconds (ms). Throughput is the number of operations/requests a system can handle successfully in a given time unit (e.g., Queries Per Second - QPS, or Requests Per Second - RPS).

Key architectural trade-offs:
1. **Serialization**: Using dense binary protocols like Protocol Buffers (gRPC) rather than JSON reduces network payload size (improving latency and throughput), but increases CPU serialization/deserialization overhead.
2. **Network Bandwidth**: High-throughput systems often batch messages (e.g., Kafka). Batching increases latency for individual messages due to queue wait time, but dramatically improves overall network throughput.
3. **Hardware Utilization**: Extreme low latency (e.g., high-frequency trading) requires dedicated, unshared CPU cores, memory pinning, and bypass of kernel OS networking layers, limiting overall parallel throughput capacity.

**Real-World Scenario:**
- **Video Streaming (e.g., YouTube)**: High throughput is crucial for streaming bulk video chunks to prevent buffering. Initial connection latency is less critical than steady stream volume.
- **Search Auto-Complete**: Requires ultra-low latency (< 50ms) to feel seamless to the user. Throughput is managed by aggressive caching at the CDN edge.`,
    prosCons: [
      { aspect: 'Latency Focus', pro: 'Snappy user experience, higher conversion rates, critical for live interactions.', con: 'Higher system cost, requires sophisticated distributed caching and persistent socket connections.' },
      { aspect: 'Throughput Focus', pro: 'High operational efficiency, lower per-request processing cost, robust against traffic spikes.', con: 'Increased response delay due to batching queues and processing buffers.' }
    ],
    interviewQA: [
      { q: "Why should we measure latency using percentiles (P95, P99) instead of average/mean?", a: "Averages hide the worst-case experiences of users. If 95% of users experience a 10ms delay but 5% experience a 10-second delay, the average might look acceptable (e.g., ~500ms), but 5% of your user base (thousands of users) will have a terrible experience. P99 tells you exactly what the 99th percentile worst-case latency is." },
      { q: "How does caching affect both latency and throughput?", a: "Caching reduces latency by serving pre-computed data from fast in-memory stores (e.g., Redis) close to the user, completely skipping database roundtrips. It simultaneously increases throughput because the database is shielded from read requests, allowing it to handle more write traffic." }
    ]
  },
  {
    id: 'fund-consistency-models',
    title: 'Consistency Models',
    iconName: 'Shield',
    color: '#ef4444',
    content: 'Rules governing data visibility and correctness across replicated distributed database nodes.',
    tags: ['CAP Theorem', 'Raft/Paxos', 'Distributed DB'],
    deepDive: `Consistency models define the guarantees a distributed system provides regarding when and how data writes become visible to all clients. In any replicated system, there is a delay between when data is written to a leader and when it propagates to followers.

Key Consistency Models:
1. **Strong Consistency (Linearizability)**: Once a write is acknowledged, any subsequent read by any client on any node will return that value or a newer write. Achieved via consensus algorithms (Raft, Paxos) or 2-Phase Commit.
2. **Eventual Consistency**: If no new updates are made, all replicas will eventually converge and return the same value. Highly performant and resilient, but clients may read stale data temporarily (e.g., DNS, Cassandra).
3. **Causal Consistency**: Ensures that operations that are causally related are seen in the same order by all nodes. If a comment is a reply to a post, all clients see the post before the comment.
4. **Read-Your-Writes Consistency**: A client who writes an update is guaranteed to see that update on subsequent reads, even if other clients see stale data temporarily. Highly critical for user profile updates.

**Real-World Scenario:**
- **Financial Transactions**: Requires **Strong Consistency** to avoid double spending.
- **Social Media Likes / Comments**: Perfectly suited for **Eventual Consistency**. A delay of a few seconds in reflecting the total count of likes does not break the application.`,
    prosCons: [
      { aspect: 'Strong Consistency', pro: 'Simple application logic, no stale data, absolute correctness.', con: 'High write latency, lower availability during network partitions (CAP theorem).' },
      { aspect: 'Eventual Consistency', pro: 'Ultra-low read/write latency, high availability (AP in CAP), horizontal scaling.', con: 'Highly complex application logic to handle data conflicts (e.g., CRDTs, Vector Clocks).' }
    ],
    interviewQA: [
      { q: "What is the relation between CAP and PACELC theorems?", a: "The CAP theorem states that in the presence of a network partition (P), you must choose between Availability (A) and Consistency (C). The PACELC theorem extends this: If there is a Partition (P), choose Availability (A) or Consistency (C); Else (E), choose Latency (L) or Consistency (C). It explains why even in normal operation, systems sacrifice consistency for speed." },
      { q: "How does Read-Your-Writes consistency work in an eventually consistent database?", a: "It is often implemented by pinning the user's session to the master database node for reads immediately after they perform a write, or by sending a write version token from the client that ensures the replica chosen for reading has caught up to at least that version." }
    ]
  },
  {
    id: 'fund-dns-resolution',
    title: 'DNS Resolution',
    iconName: 'Globe',
    color: '#10b981',
    content: 'How the internet maps human-readable domain names (google.com) to machine-readable IP addresses.',
    tags: ['Networking', 'Anycast', 'DNS Cache'],
    deepDive: `The Domain Name System (DNS) is the distributed database that translates hostnames into IP addresses. It functions as a hierarchical, highly cached phonebook of the internet.

The Resolution Process (Iterative Lookup):
1. **Local Caches**: The browser checks its internal cache. If missing, it checks the OS host file and local DNS resolver cache.
2. **Recursive Resolver**: If not cached, the request is sent to the ISP's Recursive DNS Resolver (or public ones like Cloudflare 1.1.1.1 or Google 8.8.8.8).
3. **Root Nameservers (.)**: The resolver queries one of the 13 logical root server clusters. The root server returns the address of the Top-Level Domain (TLD) server (e.g., .com).
4. **TLD Nameservers**: The resolver queries the TLD server, which returns the IP of the Authoritative Nameserver for the specific domain.
5. **Authoritative Nameservers**: The resolver queries the domain's authoritative nameserver, which provides the final IP address.
6. **Caching**: The recursive resolver caches this IP with a specific Time-To-Live (TTL) and returns it to the client.

**Real-World Optimization:**
- **DNS Anycast**: Binds multiple physical servers around the world to a single IP address, routing requests to the closest location using BGP routing, ensuring ultra-fast DNS lookups.`,
    prosCons: [
      { aspect: 'Distributed DNS', pro: 'No single point of failure, highly scalable, local latency is low due to caching.', con: 'Changes take time to propagate globally due to TTL caches; hard to instantly retract a faulty IP.' }
    ],
    interviewQA: [
      { q: "What is the difference between an A Record and a CNAME Record?", a: "An A Record maps a domain directly to an IPv4 address (e.g., example.com -> 93.184.216.34). A CNAME (Canonical Name) Record maps an alias domain to another domain (e.g., www.example.com -> example.com), which requires an additional DNS lookup to resolve the destination's A record." },
      { q: "How do CDNs use DNS for geographical routing?", a: "When a DNS query reaches the authoritative nameserver, it looks at the client's IP address (or EDNS client subnet) and resolves the domain to the IP address of the CDN edge server closest to that user geographically, minimizing latency." }
    ]
  },
  {
    id: 'fund-protocols',
    title: 'Protocols (HTTP, gRPC, WebSockets)',
    iconName: 'Zap',
    color: '#a855f7',
    content: 'Selecting the correct communication protocol for client-server and inter-service messaging.',
    tags: ['HTTP/3', 'HTTP/2', 'Protobuf', 'Bi-directional'],
    deepDive: `System design requires matching the right protocol to your data transmission requirements:

1. **HTTP/1.1 vs HTTP/2 vs HTTP/3**:
   - **HTTP/1.1**: Simple, text-based, sequential requests (suffers from Head-of-Line blocking over TCP).
   - **HTTP/2**: Multiplexes multiple requests/responses over a single TCP connection, uses binary headers and server push.
   - **HTTP/3**: Switches from TCP to QUIC (UDP-based). It eliminates Head-of-Line blocking entirely at the transport layer, allows seamless connection migration across network changes (e.g., switching from Wi-Fi to cellular).

2. **gRPC (Google Remote Procedure Call)**:
   - High-performance, low-latency framework designed for microservices.
   - Uses **HTTP/2** as transport and **Protocol Buffers (Protobuf)** for compact binary serialization.
   - Strongly typed contracts via \`.proto\` schema definitions.

3. **WebSockets**:
   - Upgrades an HTTP connection to a long-lived, full-duplex, bi-directional TCP socket.
   - Ideal for real-time applications where server needs to push updates instantly (e.g., chat, gaming, stocks).`,
    prosCons: [
      { aspect: 'gRPC (Services)', pro: 'Extremely fast, strongly-typed, auto-generated client code, multiplexed streaming.', con: 'Difficult to consume directly from web browsers (requires gRPC-Web proxy); human-unreadable binary payload.' },
      { aspect: 'WebSockets (Real-time)', pro: 'Sub-millisecond server-to-client push latency, minimal packet headers.', con: 'Stateful connections require complex load balancing (sticky sessions) and tie up server memory.' }
    ],
    interviewQA: [
      { q: "What is HTTP Head-of-Line (HoL) blocking and how does HTTP/3 solve it?", a: "In HTTP/1.1, requests are queued sequentially. If one request is slow, all subsequent requests are blocked. HTTP/2 solves this at the application layer by multiplexing streams over one TCP connection. However, if a TCP packet is lost, the entire TCP connection stalls (HoL blocking at the TCP layer). HTTP/3 uses QUIC (UDP), where streams are independent. If a packet in stream A is lost, stream B continues uninterrupted." },
      { q: "When would you choose WebSockets over Server-Sent Events (SSE)?", a: "Use WebSockets when you need bi-directional real-time communication (both client and server send rapid data, like a multiplayer game or collaborative whitebox). Use SSE if you only need one-way real-time streaming from server to client (like a live news feed, notification engine, or LLM response stream), as SSE runs over standard HTTP, supports auto-reconnection, and is simpler to implement." }
    ]
  },
  {
    id: 'fund-cap-pacelc',
    title: 'CAP & PACELC Theorems',
    iconName: 'Cpu',
    color: '#3b82f6',
    content: 'Analyzing fundamental trade-offs in distributed data systems during partitions and normal operations.',
    tags: ['Consistency', 'Availability', 'Network Partition'],
    deepDive: `The **CAP Theorem** (by Eric Brewer) states that a distributed system can guarantee at most two out of three properties simultaneously:
- **C (Consistency)**: Every read receives the most recent write or an error.
- **A (Availability)**: Every non-failing node returns a non-error response (without guarantee of containing the latest write).
- **P (Partition Tolerance)**: The system continues to operate despite arbitrary message loss or network partitions.

Since network networks will inevitably experience partitions (P), a distributed system *must* choose between **CP (Consistency/Partition)** or **AP (Availability/Partition)**.

The **PACELC Theorem** extends CAP by describing the trade-off in the absence of partitions (normal operation):
- If there is a **P (Partition)**, choose **A (Availability)** or **C (Consistency)**.
- **E (Else)**, choose **L (Latency)** or **C (Consistency)**.
This highlights that even in a healthy network, choosing strong consistency requires waiting for replica coordination, which increases latency.`,
    prosCons: [
      { aspect: 'CP System (e.g. HBase)', pro: 'Absolute data correctness, transaction safety, excellent for financials.', con: 'If replicas cannot agree, writes/reads fail, reducing availability.' },
      { aspect: 'AP System (e.g. Cassandra)', pro: 'High write throughput, highly resilient, offline writes possible.', con: 'Stale reads, conflicts require complex reconciliation (e.g. last-write-wins or vector clocks).' }
    ],
    interviewQA: [
      { q: "Why is a CA system (Consistency + Availability) practically impossible in distributed environments?", a: "For a system to achieve CA, it must have zero network failures. In the real world, network partitions, router failures, and cable cuts are inevitable. When a partition occurs, the system cannot write to separated nodes and remain consistent *and* available. Thus, P is a given, and you must choose between C and A." }
    ]
  },
  {
    id: 'fund-caching-strategies',
    title: 'Caching Strategies',
    iconName: 'HardDrive',
    color: '#eab308',
    content: 'Optimizing read performance, reducing database load, and managing state synchronization.',
    tags: ['Redis', 'Eviction Policies', 'Cache Invalidation'],
    deepDive: `Caching stores copies of frequently requested data in high-speed, temporary storage (like RAM in Redis or Memcached). Selecting the right cache pattern determines consistency and latency:

1. **Cache-Aside (Lazy Loading)**:
   - The application checks the cache first. If a cache miss occurs, it queries the database, writes the result to the cache, and returns it.
   - *Best for*: Read-heavy, general-purpose workloads.

2. **Write-Through**:
   - The application writes to the cache, which synchronously updates the database.
   - *Best for*: Ensuring strict consistency, avoiding stale cache. Increases write latency.

3. **Write-Back (Write-Behind)**:
   - The application writes to the cache, which acknowledges instantly. The cache asynchronously batches and flushes writes to the database.
   - *Best for*: High-frequency write applications (e.g., IoT telemetry, online game scores). Risk of data loss if the cache node crashes.`,
    prosCons: [
      { aspect: 'Cache-Aside', pro: 'Cache contains only requested data, database failures do not break the app (it just falls back to DB).', con: 'Cache misses incur three steps (double trip), data can become stale if database is updated directly.' },
      { aspect: 'Write-Back', pro: 'Incredibly fast write speed, reduces intense DB write IOPS spikes.', con: 'Risk of data loss, high complexity to implement asynchronous sync queues.' }
    ],
    interviewQA: [
      { q: "What is Cache Penetration, Cache Avalanche, and Cache Stampede, and how do you solve them?", a: "1. **Penetration**: Requests for non-existent keys bypass cache and hit DB. *Solve*: Cache empty/null values, or use a Bloom Filter. 2. **Avalanche**: Many cache keys expire at the same time, causing a DB overload. *Solve*: Add random jitter to TTLs. 3. **Stampede (Dogpiling)**: A hot key expires, and thousands of concurrent requests attempt to read DB and write to cache at once. *Solve*: Use distributed locking, or pre-warm caches before expiry." }
    ]
  }
];

const defaultComponents = [
  {
    id: 'comp-load-balancer',
    title: 'Load Balancer',
    iconName: 'Zap',
    color: '#6366f1',
    content: 'Distributes incoming network or application traffic across a pool of healthy backend servers.',
    tags: ['Reverse Proxy', 'Layer 4 vs 7', 'Nginx/HAProxy'],
    deepDive: `A Load Balancer acts as a reverse proxy, positioning itself between incoming client requests and backend server farms. It ensures high availability, scalability, and load distribution.

Key Algorithmic Strategies:
1. **Round Robin**: Standard sequential routing. Excellent when servers are of equal hardware capability.
2. **Least Connections**: Routes to the server with the fewest active TCP connections. Ideal for long-running transactions.
3. **IP Hashing**: Hashes the client's IP address to route them to a specific persistent server (sticky session).

Layer 4 vs Layer 7 Load Balancing:
- **Layer 4 (L4)**: Operates at the transport layer (TCP/UDP). It routes traffic based on IP address and port without reading request payloads. Super fast, low CPU consumption.
- **Layer 7 (L7)**: Operates at the application layer (HTTP/HTTPS). It inspects request headers, paths, cookies, and payloads. It allows smart path-based routing (e.g., /api/users -> User Service), SSL termination, and rate limiting.`,
    prosCons: [
      { aspect: 'Layer 7 Balancing', pro: 'Smart content-based routing, easily terminates SSL certificates, allows header-based auth checks.', con: 'High CPU overhead due to packet parsing, introduces potential single point of failure if not clustered.' }
    ],
    interviewQA: [
      { q: "How do load balancers maintain high availability for themselves?", a: "By using an active-passive setup with virtual IPs (VIPs). Two load balancer nodes run heartbeat protocols (like Keepalived/VRRP). If the active node fails, the passive node instantly binds the Virtual IP and takes over traffic within milliseconds, ensuring zero downtime." }
    ]
  },
  {
    id: 'comp-api-gateway',
    title: 'API Gateway',
    iconName: 'Shield',
    color: '#a855f7',
    content: 'The unified entrance for clients, managing routing, auth, rate limiting, and request transformation.',
    tags: ['Rate Limiting', 'Authentication', 'Kong/Apigee'],
    deepDive: `An API Gateway serves as a reverse proxy that shields backend microservices by routing client requests through a single entry point. It manages administrative and security-related cross-cutting concerns, enabling microservices to focus solely on business capabilities.

Core Features:
1. **Request Routing & Aggregation**: Combines requests to multiple internal services into a single client-facing endpoint, reducing client-to-server roundtrips.
2. **Authentication & Authorization**: Decodes JWTs, performs OAuth validation, and enforces access control before forwarding traffic.
3. **Rate Limiting**: Defends backend systems from Denial of Service (DoS) attacks and spikes by restricting request velocity using algorithms like Token Bucket or Leaky Bucket.
4. **SSL Termination**: Decrypts incoming HTTPS traffic at the gateway, avoiding the CPU decryption tax on internal microservices.`,
    prosCons: [
      { aspect: 'Unified Gateway', pro: 'Simplifies client code, hides microservice network topologies, provides central telemetry/logging.', con: 'Can become a single point of failure and a latency bottleneck if not scaled horizontally.' }
    ],
    interviewQA: [
      { q: "Explain the Token Bucket algorithm used in API Gateways.", a: "A token bucket holds a maximum number of tokens. Tokens are added to the bucket at a constant rate. When a request arrives, the gateway attempts to draw a token. If a token is available, the request is allowed. If the bucket is empty, the request is blocked (HTTP 429 Too Many Requests). It easily handles short burst traffic while maintaining a steady long-term rate." }
    ]
  },
  {
    id: 'comp-microservices',
    title: 'Microservices',
    iconName: 'Server',
    color: '#10b981',
    content: 'Decomposing complex software systems into loosely coupled, highly domain-focused services.',
    tags: ['Domain Driven Design', 'Loose Coupling', 'Saga Pattern'],
    deepDive: `Microservices structure an application as a collection of modular, autonomous services. Each service is aligned with a specific business domain (Domain-Driven Design), possesses its own independent database (Database-per-Service), and interacts via light network protocols (gRPC, REST, or message queues).

Key Architectural Rules:
1. **Single Responsibility**: Each service does one thing well (e.g., Billing Service only handles invoicing).
2. **Data Isolation**: Services *must not* share databases. Shared databases create tight coupling, blocking independent deployments.
3. **Asynchronous Communication**: Prefers event-driven communication (Kafka, RabbitMQ) over synchronous REST calls to prevent cascading failures.`,
    prosCons: [
      { aspect: 'Microservice Design', pro: 'Independent deployments, localized scaling, language flexibility, fault isolation (one crash doesn\'t kill the entire system).', con: 'Complex distributed transactions (requires Saga/2PC), challenging debugging, network latency between hops.' }
    ],
    interviewQA: [
      { q: "How do you manage distributed transactions across multiple microservices?", a: "We avoid 2-Phase Commit (2PC) as it is blocking and hurts scalability. Instead, we use the **Saga Pattern**, which coordinates a sequence of local transactions. Each step updates its database. If a subsequent step fails, the Saga triggers compensatory transactions that execute backward to undo changes, preserving eventual consistency." }
    ]
  },
  {
    id: 'comp-sql-database',
    title: 'SQL Database',
    iconName: 'Database',
    color: '#f59e0b',
    content: 'Relational data storage emphasizing structural schemas, integrity, and strict ACID transaction safety.',
    tags: ['PostgreSQL', 'ACID Properties', 'Indexes'],
    deepDive: `Relational Database Management Systems (RDBMS) store data in tabular formats with strictly defined schemas, foreign key relationships, and robust index engines.

ACID Guarantees:
- **Atomicity**: Entire transaction completes successfully, or none of it does (Rollback).
- **Consistency**: Data adheres to schema constraints, keeping the database in a valid state.
- **Isolation**: Concurrent transactions execute without interfering with each other (read-committed, serializable isolation).
- **Durability**: Once committed, changes survive system crashes (written to Write-Ahead Log - WAL).

Scaling SQL:
1. **Vertical Scaling**: Larger CPU, more RAM.
2. **Replication**: Active-Passive setup. One write leader, multiple read replicas (horizontal read scaling).
3. **Horizontal Partitioning / Sharding**: Row-level distribution across separate hardware.`,
    prosCons: [
      { aspect: 'Relational Model', pro: 'Strict consistency, complex transactional support, mature index mechanisms (B-Trees), standardized querying (SQL).', con: 'Difficult schema modifications on massive tables, hard to scale write operations horizontally.' }
    ],
    interviewQA: [
      { q: "What is a B-Tree index and how does it speed up queries?", a: "A B-Tree is a self-balancing search tree designed to work efficiently on secondary storage. It maintains sorted data and allows searches, sequential access, insertions, and deletions in logarithmic time O(log n). It speeds up queries by reducing the number of disk page reads required to locate a specific row." }
    ]
  },
  {
    id: 'comp-nosql-store',
    title: 'NoSQL Store',
    iconName: 'HardDrive',
    color: '#ec4899',
    content: 'Highly scalable, schema-less data systems optimized for high throughput and low-latency access.',
    tags: ['MongoDB/Cassandra', 'Horizontal Scaling', 'BASE properties'],
    deepDive: `NoSQL databases are designed to store unstructured or semi-structured data at scale, trading absolute relational consistency for massive write speeds and horizontal scalability.

Primary Architecture Types:
1. **Document Stores (MongoDB)**: Stores nested objects (JSON/BSON). Excellent for catalog indexing, blogs, content.
2. **Key-Value Stores (Redis, DynamoDB)**: Stores pairs. Sub-millisecond lookup, perfect for sessions, shopping carts.
3. **Wide-Column Stores (Cassandra, ScyllaDB)**: Stores data in columns. Incredible write speed and petabyte scalability (uses LSM trees).
4. **Graph Databases (Neo4j)**: Focuses on highly interconnected nodes and edges. Great for social networks and recommendation systems.`,
    prosCons: [
      { aspect: 'NoSQL Store', pro: 'Flexible dynamic schemas, native horizontal scaling (auto-sharding), high write throughput.', con: 'No native complex JOIN operations, weak ACID guarantees (mostly BASE: Basic Availability, Soft State, Eventual Consistency).' }
    ],
    interviewQA: [
      { q: "What is an LSM Tree and how does it differ from a B-Tree?", a: "LSM (Log-Structured Merge) Trees are optimized for write-heavy workloads. They write updates sequentially to an in-memory buffer (MemTable) and periodically flush them as immutable files to disk (SSTables), turning random writes into fast sequential writes. B-Trees perform random in-place updates, which can be much slower due to disk IO seek times, making B-Trees better for read-heavy and LSM Trees better for write-heavy databases." }
    ]
  },
  {
    id: 'comp-message-queue',
    title: 'Message Queue',
    iconName: 'MessageSquare',
    color: '#3b82f6',
    content: 'Asynchronous event buffers decoupled to allow communication between producers and consumers.',
    tags: ['Kafka/RabbitMQ', 'Event Driven', 'Dead Letter Queue'],
    deepDive: `Message Queues and Event Streaming platforms act as temporary broker layers that hold messages sent by producers until processed and acknowledged by consumers. They are essential for decoupling distributed microservices and smoothing out traffic spikes.

Core Architectural Paradigms:
1. **Point-to-Point (Queues)**: A message goes to exactly one consumer (e.g., RabbitMQ). Perfect for heavy background tasks.
2. **Publish-Subscribe (Streams)**: A message is broadcasted to multiple topic subscribers (e.g., Apache Kafka). Perfect for real-time telemetry, notifications, and event-sourcing.

Delivery Guarantees:
- **At-least-once**: Messages are never lost, but may be duplicated (common).
- **At-most-once**: Messages are sent once; if a network glitch occurs, they are lost. No duplication.
- **Exactly-once**: Hardest to achieve. Requires end-to-end transactional coordination between broker, producer, and consumer.`,
    prosCons: [
      { aspect: 'Message Broker', pro: 'Absorbs peak traffic spikes (load leveling), isolates service failures, enables rapid parallel event processing.', con: 'Introduces system complexity, potential message out-of-order issues, and synchronization lags.' }
    ],
    interviewQA: [
      { q: "How does Apache Kafka achieve such high write throughput compared to standard databases?", a: "Kafka achieves massive write speeds by utilizing: 1. **Append-Only Commit Logs**: All writes are appended to the end of the file (sequential disk I/O, which is incredibly fast). 2. **Page Cache**: It writes directly to the OS kernel page cache. 3. **Zero-Copy Optimization**: Uses the OS \`sendfile\` system call to transfer data directly from page cache to the network socket, bypassing application-space memory copying." }
    ]
  },
  {
    id: 'comp-cdn',
    title: 'CDN (Content Delivery Network)',
    iconName: 'Cloud',
    color: '#06b6d4',
    content: 'A globally distributed proxy network delivering static and dynamic content with ultra-low latency.',
    tags: ['Edge Servers', 'Geo-routing', 'Cloudflare/Akamai'],
    deepDive: `A CDN is a geographically distributed network of proxy edge servers placed close to the physical location of internet users. It caches static assets (images, video fragments, JavaScript, CSS stylesheets) and acts as an accelerator for dynamic content routing.

Key Concepts:
- **Origin Server**: The master server hosting the source code and databases.
- **Edge Servers**: CDN nodes located in local Points of Presence (PoPs) worldwide.
- **TTL (Time to Live)**: The duration an asset remains cached on the edge before the CDN queries the origin to check for updates.
- **Cache Invalidation**: Forcing edge servers to purge cached copies and fetch fresh files (can be expensive if done globally).`,
    prosCons: [
      { aspect: 'Global Edge Caching', pro: 'Reduces latency by up to 90%, protects origin servers from crash loads, simplifies global scale.', con: 'Stale content bugs can be difficult to debug, adds cost for high-bandwidth dynamic streaming.' }
    ],
    interviewQA: [
      { q: "How does a CDN handle dynamic content that cannot be cached?", a: "By using Dynamic Content Acceleration (DCA). The CDN edge server optimizes TCP handshakes, keeps open persistent TCP connections to the origin server, and compresses data. It also routes requests through Cloudflare/Akamai's private global fiber network instead of the public internet, avoiding BGP routing bottlenecks." }
    ]
  },
  {
    id: 'comp-cache-redis',
    title: 'Cache (Redis)',
    iconName: 'Activity',
    color: '#ef4444',
    content: 'In-memory key-value data storage utilized to accelerate reading and relieve database workloads.',
    tags: ['In-Memory', 'LRU Eviction', 'Data Structures'],
    deepDive: `In-memory databases store data in RAM, removing disk seek latency entirely and allowing read/write operations to complete in sub-milliseconds. Redis is the industry standard cache due to its support for complex data structures (Strings, Hashes, Lists, Sets, Sorted Sets, HyperLogLogs).

Eviction Policies (When Cache Fills Up):
1. **LRU (Least Recently Used)**: Discards the keys that haven't been accessed for the longest time (most common).
2. **LFU (Least Frequently Used)**: Discards keys with the lowest hit count.
3. **TTL Expiry**: Discards keys whose Time-To-Live has passed.

Data Persistence options in Redis:
- **RDB (Redis Database)**: Point-in-time snapshots of dataset written to disk at specified intervals.
- **AOF (Append Only File)**: Logs every write command received by the server. Highly durable but creates larger files.`,
    prosCons: [
      { aspect: 'In-Memory Cache', pro: 'Sub-millisecond latency, processes hundreds of thousands of operations per second, excellent built-in data types.', con: 'Extremely expensive (RAM is far pricier than SSD storage), data is volatile if persistence is disabled.' }
    ],
    interviewQA: [
      { q: "What is Cache Stampede and how do you prevent it in high-traffic applications?", a: "Cache Stampede happens when a hot cache key expires. Multiple concurrent requests see a cache miss and simultaneously query the database to re-write the cache, bringing down the DB. *Prevention*: 1. Use Mutual Exclusion (Mutex locking): the first request acquires a lock, queries the DB, and releases it, while other requests wait or read stale cache. 2. Background pre-warming: asynchronously re-calculate the key's value before it expires." }
    ]
  }
];

const defaultPatterns = [
  {
    id: 'pat-database-sharding',
    title: 'Database Sharding',
    iconName: 'Database',
    color: '#f59e0b',
    content: 'Partitioning rows horizontally across separate database clusters to distribute intense write loads.',
    tags: ['Horizontal Partition', 'Consistent Hash', 'Hotspots'],
    deepDive: `Sharding is a horizontal partitioning technique that splits rows of a massive relational table into separate physical database instances (shards), each running on dedicated hardware.

Sharding Strategies:
1. **Range-Based Sharding**: Routes writes based on values (e.g., users with last names A-E go to Shard 1, F-J to Shard 2). Easy to implement, but leads to severely unbalanced shards.
2. **Hash-Based Sharding**: Applies a hash function to a Shard Key (e.g., hash(user_id) % number_of_shards). Distributes data extremely evenly, but makes adding new shards very complex (requires moving all data).
3. **Consistent Hashing**: Solves horizontal scaling issues by mapping nodes and keys onto a circular hash ring, ensuring that adding or removing a shard node only requires reshuffling a fraction of the keys.

Key Sharding Challenges:
- **No Cross-Shard Joins**: SQL queries cannot perform JOIN operations across different database servers. The application must perform multiple queries and merge them in memory.
- **Resharding**: Rebalancing data when a shard fills up is a massive operational headache.`,
    prosCons: [
      { aspect: 'Database Sharding', pro: 'Bypasses single-machine disk/CPU limits, distributes massive write traffic, increases system capacity.', con: 'Increases architectural complexity, breaks transaction ACID guarantees across shards, complex routing layer maintenance.' }
    ],
    interviewQA: [
      { q: "What is a Shard Key and how do you choose a good one?", a: "A Shard Key is the column used to determine which shard a specific row is stored in. A good shard key: 1. Distributes reads and writes evenly across shards. 2. Keeps related queries within the same shard (minimizing cross-shard lookups). For example, \`user_id\` is an excellent shard key for a user profile database, while \`country\` is poor because it creates hot shards (e.g., highly populated countries get all the traffic)." }
    ]
  },
  {
    id: 'pat-microservices-mesh',
    title: 'Microservices Mesh',
    iconName: 'Layout',
    color: '#10b981',
    content: 'Dedicated infrastructure layer orchestrating secure, observable, and resilient service-to-service calls.',
    tags: ['Sidecar Proxy', 'mTLS', 'Istio/Linkerd'],
    deepDive: `As a microservice architecture grows, managing inter-service communication (routing, retries, security, logging) becomes a nightmare if coded inside each service. A **Service Mesh** is a dedicated infrastructure layer that handles this out-of-process.

Data Plane vs Control Plane:
- **Data Plane**: A network of lightweight sidecar proxies (typically Envoy) deployed directly alongside each microservice container. All network traffic between services is intercepted and routed through these sidecars.
- **Control Plane**: A centralized controller (like Istio or Linkerd) that manages and configures sidecars, updates routing rules, distributes TLS certificates, and gathers telemetry.

Core Benefits:
1. **mTLS (Mutual TLS)**: Automatically encrypts all service-to-service traffic and handles certificate rotation without developer intervention.
2. **Traffic Splitting**: Easily performs Canary deployments (routing 5% of traffic to a new service version).
3. **Circuit Breaking**: Automatically blocks requests to an internal service if it starts failing, protecting the system from cascading crashes.`,
    prosCons: [
      { aspect: 'Service Mesh', pro: 'Standardized security/observability across all languages, out-of-application routing configuration, automatic retries/circuit breaking.', con: 'Adds latency to every network hop (due to sidecar proxy intercepting), increases container infrastructure complexity.' }
    ],
    interviewQA: [
      { q: "Explain the Sidecar Pattern in Service Mesh.", a: "The Sidecar pattern deploys a helper container (the proxy) alongside the main application container within the same pod or virtual machine. They share the same network namespace. This proxy intercepts all incoming and outgoing network traffic, handling security (mTLS), routing, and logging on behalf of the application, which doesn't even realize the proxy is there." }
    ]
  },
  {
    id: 'pat-event-sourcing',
    title: 'Event Sourcing',
    iconName: 'MessageSquare',
    color: '#3b82f6',
    content: 'Persisting application state as an immutable chronological stream of lifecycle events.',
    tags: ['Audit Log', 'CQRS Integration', 'Event Store'],
    deepDive: `Traditional databases only store the *current* state of a row. **Event Sourcing** shifts this paradigm by storing the entire history of state changes as a sequence of immutable events in an append-only Event Store.

How it works:
- Instead of updating a user's address directly in the database (\`UPDATE users SET address = '...'\`), the system appends a \`UserAddressChanged\` event.
- To determine the current state of an entity, the system reads and replays all historical events associated with that entity ID from the beginning (reconstitution).
- To speed up this process, the system periodically takes a **Snapshot** of the entity state (e.g., every 100 events), replaying only the subsequent events since that snapshot.

Perfect pairing with CQRS:
Because querying a massive list of append-only events is slow, Event Sourcing is almost always paired with **CQRS (Command Query Responsibility Segregation)**. The write side appends events, and an asynchronous worker listens to these events to project them into a highly optimized read database (e.g., Elasticsearch).`,
    prosCons: [
      { aspect: 'Event Sourcing', pro: 'Perfect 100% accurate audit log, easy debugging (replay events to reproduce bugs), temporal queries (view state at any point in history).', con: 'High steep learning curve, event schema evolution is difficult (handling changes in event structure over years).' }
    ],
    interviewQA: [
      { q: "What are the main drawbacks of Event Sourcing and how do you mitigate them?", a: "The primary drawback is read complexity and latency. Having to replay 10,000 events to find a user's current address is highly inefficient. We mitigate this using: 1. **Snapshots**: caching the state at event #9,900. 2. **CQRS Projection**: keeping a separate, updated relational read table that is updated in real-time as events occur, allowing reads to be simple O(1) or indexed lookups." }
    ]
  },
  {
    id: 'pat-leader-election',
    title: 'Leader Election',
    iconName: 'Shield',
    color: '#ec4899',
    content: 'Selecting a single node as coordinator to ensure consensus and prevent split-brain conflicts.',
    tags: ['Consensus', 'Split-Brain', 'ZooKeeper'],
    deepDive: `In a distributed cluster of nodes, certain tasks (such as writing to a primary database, scheduling jobs, or managing cluster membership) must be executed by exactly *one* node to avoid conflict and maintain consistency. **Leader Election** is the process of designating that single coordinator.

Key Concepts:
- **Split-Brain**: A critical failure state where a network partition divides a cluster into two halves, and both halves elect a separate leader. If both leaders perform writes, it results in catastrophic data corruption.
- **Quorum**: To prevent split-brain, a leader can only be elected if it gains votes from a strict majority of nodes in the cluster (e.g., at least 3 nodes in a 5-node cluster).
- **Consensus Algorithms**: Protocols like Raft, Paxos, or Zab maintain state machines that safely elect leaders and replicate logs across nodes.

Distributed Locking (Lightweight Alternative):
Instead of running a full Raft protocol, clusters often use distributed coordinate locks in high-consistency stores like ZooKeeper, Consul, or Redis (using Redlock) where nodes compete to write a temporary lease key. The node that secures the lease becomes the leader until the lease expires.`,
    prosCons: [
      { aspect: 'Consensus Leader', pro: 'Guarantees single writer correctness, highly resilient (auto-replaces failed leaders).', con: 'During election windows (seconds), the cluster is unavailable for writes; high protocol overhead.' }
    ],
    interviewQA: [
      { q: "Explain the split-brain problem and how Quorum solves it.", a: "If a cluster of 5 nodes splits due to network failure into 2 nodes (Group A) and 3 nodes (Group B), split-brain could cause both groups to think the other died and elect separate leaders. Quorum prevents this by requiring a majority: \`(N/2) + 1\` votes. Group A (2 nodes) cannot reach quorum (needs 3 votes), so it cannot elect a leader. Group B (3 nodes) can reach quorum and elects a single leader. Thus, only one active leader exists, preventing data corruption." }
    ]
  },
  {
    id: 'pat-circuit-breaker',
    title: 'Circuit Breaker',
    iconName: 'Zap',
    color: '#ef4444',
    content: 'Preventing cascading microservice failures by fast-failing calls to degraded internal dependencies.',
    tags: ['Cascading Failure', 'Resilience', 'Resilience4j'],
    deepDive: `In a microservice system, services call other services over the network. If a downstream service (e.g., Recommendation Service) slows down or crashes, the upstream service (e.g., Homepage Service) will hold open TCP connections and exhaust its thread pool waiting for timeouts. This leads to a cascading system failure.

The **Circuit Breaker** pattern protects systems by intercepting network requests and wrapping them in a state machine:

1. **Closed**: Normal operations. All requests are sent to the downstream service. If failures exceed a specific threshold (e.g., 50% failures over 10 seconds), the circuit trips and moves to **Open**.
2. **Open**: Requests are fast-failed immediately at the caller level, returning a fallback response (e.g., cached or empty recommendations). Downstream service is protected from traffic, allowing it to recover.
3. **Half-Open**: After a cooldown period (e.g., 30 seconds), the breaker lets a limited number of requests pass through. If they succeed, it assumes the service is healthy and moves back to **Closed**. If they fail, it immediately returns to **Open**.`,
    prosCons: [
      { aspect: 'Circuit Breaker', pro: 'Prevents cascading server crashes, provides instant fallback degradation, allows degraded systems to heal.', con: 'Requires careful tuning of timeout/failure thresholds, adds fallback business logic complexity.' }
    ],
    interviewQA: [
      { q: "What is a 'fallback' response in a Circuit Breaker, and give an example?", a: "A fallback is the alternative response returned to the client when the circuit is Open, avoiding a raw error. For example, in an e-commerce app, if the 'Personalized Product Recommendations Service' fails, the Circuit Breaker trips open, and the homepage service falls back to returning a hardcoded, cached list of 'Popular Items' instead of crashing the entire page." }
    ]
  },
  {
    id: 'pat-cqrs',
    title: 'CQRS Pattern',
    iconName: 'Layers',
    color: '#a855f7',
    content: 'Splitting read and write structures into independent optimized models for extreme scale.',
    tags: ['Command-Query', 'Read Projections', 'Elasticsearch'],
    deepDive: `CQRS stands for **Command Query Responsibility Segregation**. It advocates that the model used to write information to a database should be entirely separate from the model used to read information.

Why split them?
In complex applications, writes require strict validation, transaction isolation, and business logic. Reads require fast indexing, complex search, and low-latency joins. Trying to use a single SQL schema or ORM model for both results in highly sub-optimal performance.

Implementation:
- **Write Side (Commands)**: Handles inserts, updates, and deletes. Optimized for write throughput and transaction safety (often a highly normalized SQL DB or append-only Event Store).
- **Read Side (Queries)**: Handles search and display. Optimized for fast reads (often a denormalized database like Elasticsearch, MongoDB, or Read-Replicas).
- **Syncing**: An asynchronous event handler (using Kafka/RabbitMQ) listens to writes, transforms the data, and updates the read-side projections. This introduces **eventual consistency**.`,
    prosCons: [
      { aspect: 'CQRS Split', pro: 'Optimized performance for both read and write models, independent scaling, perfect support for complex text searches.', con: 'Eventual consistency delay between write and read databases, double infrastructure costs, high code complexity.' }
    ],
    interviewQA: [
      { q: "How do you handle eventual consistency in a CQRS system when a user submits a form and expects to see the update instantly?", a: "1. **UI Optimistic Updates**: The client UI instantly renders the change as if it has been saved. 2. **Polling / Sockets**: The client polls the read DB or waits for a WebSocket notification confirming the read database has synced. 3. **Write-Read bypass for User Sessions**: For critical edits (like profile names), the frontend reads directly from the write-side primary DB for that specific user session while serving general traffic from the read projection." }
    ]
  }
];

const caseStudies = [
  {
    title: 'YouTube Architecture',
    company: 'Google',
    tags: ['Video Streaming', 'Scalability'],
    architecture: {
      nodes: [
        { id: '1', type: 'client', label: 'Users', position: '1 / 2', description: 'Web/Mobile Clients' },
        { id: '2', type: 'lb', label: 'Load Balancer', position: '2 / 2', description: 'Geo-distributed LB' },
        { id: '3', type: 'server', label: 'Video Service', position: '3 / 1', description: 'Encoding & Streaming' },
        { id: '4', type: 'server', label: 'Metadata Service', position: '3 / 3', description: 'User info & Comments' },
        { id: '5', type: 'db', label: 'SQL Database', position: '4 / 2', description: 'Vitess Sharded MySQL' }
      ]
    }
  },
  {
    title: 'Uber Real-time Dispatch',
    company: 'Uber',
    tags: ['Geo-location', 'Concurrency'],
    architecture: {
      nodes: [
        { id: '1', type: 'client', label: 'Riders/Drivers', position: '1 / 2', description: 'Mobile Apps' },
        { id: '2', type: 'lb', label: 'API Gateway', position: '2 / 2', description: 'Rate limiting & Auth' },
        { id: '3', type: 'server', label: 'Dispatch Service', position: '3 / 2', description: 'Matching Logic' },
        { id: '4', type: 'db', label: 'NoSQL Store', position: '4 / 2', description: 'Schemaless database' }
      ]
    }
  }
];

const sections = [
  { id: 'fundamentals', icon: BookOpen, name: 'Fundamentals', description: 'Core principles of scalable systems' },
  { id: 'components', icon: Layers, name: 'Components', description: 'Visual building blocks for architecture' },
  { id: 'patterns', icon: Layout, name: 'Patterns', description: 'Common architectural solutions' },
  { id: 'casestudies', icon: Globe, name: 'Case Studies', description: 'Real-world system breakdowns' },
  { id: 'ai-architect', icon: Sparkles, name: 'AI Architect', description: 'AI-powered design assistant' },
];

function App() {
  // ----------------------------------------------------
  // CORE STATES (WITH PERSISTENCE IN LOCAL STORAGE)
  // ----------------------------------------------------
  const [activeSection, setActiveSection] = useState('fundamentals');
  const [fundamentals, setFundamentals] = useState(() => {
    const saved = localStorage.getItem('sys_design_fundamentals');
    return saved ? JSON.parse(saved) : defaultFundamentals;
  });
  const [components, setComponents] = useState(() => {
    const saved = localStorage.getItem('sys_design_components');
    return saved ? JSON.parse(saved) : defaultComponents;
  });
  const [patterns, setPatterns] = useState(() => {
    const saved = localStorage.getItem('sys_design_patterns');
    return saved ? JSON.parse(saved) : defaultPatterns;
  });

  const [selectedCase, setSelectedCase] = useState(caseStudies[0]);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isDesigning, setIsDesigning] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState(null);

  // ----------------------------------------------------
  // SLIDE DRAWER & NOTE EDITOR STATES
  // ----------------------------------------------------
  const [selectedNote, setSelectedNote] = useState(null);
  const [drawerMode, setDrawerMode] = useState('read'); // 'read', 'edit', 'create'
  const [drawerSection, setDrawerSection] = useState('fundamentals');
  const [activeDrawerTab, setActiveDrawerTab] = useState('overview'); // 'overview', 'deepdive', 'qa'

  // Form Fields
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formDeepDive, setFormDeepDive] = useState('');
  const [formTags, setFormTags] = useState('');
  const [formIconName, setFormIconName] = useState('BookOpen');
  const [formColor, setFormColor] = useState('#6366f1');
  const [formProsCons, setFormProsCons] = useState([]);
  const [formInterviewQA, setFormInterviewQA] = useState([]);

  const fileInputRef = useRef(null);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('sys_design_fundamentals', JSON.stringify(fundamentals));
  }, [fundamentals]);

  useEffect(() => {
    localStorage.setItem('sys_design_components', JSON.stringify(components));
  }, [components]);

  useEffect(() => {
    localStorage.setItem('sys_design_patterns', JSON.stringify(patterns));
  }, [patterns]);

  // ----------------------------------------------------
  // NOTE CRUD OPERATIONS
  // ----------------------------------------------------
  const openNoteDetails = (note, section) => {
    setSelectedNote(note);
    setDrawerSection(section);
    setDrawerMode('read');
    setActiveDrawerTab('overview');

    // Prep Form States
    setFormTitle(note.title || '');
    setFormContent(note.content || '');
    setFormDeepDive(note.deepDive || '');
    setFormTags(note.tags ? note.tags.join(', ') : '');
    setFormIconName(note.iconName || 'BookOpen');
    setFormColor(note.color || '#6366f1');
    setFormProsCons(note.prosCons || []);
    setFormInterviewQA(note.interviewQA || []);
  };

  const openCreateNote = (section) => {
    setSelectedNote(null);
    setDrawerSection(section);
    setDrawerMode('create');
    setActiveDrawerTab('overview');

    // Set Default Form States
    setFormTitle('');
    setFormContent('');
    setFormDeepDive('');
    setFormTags('');
    setFormIconName(section === 'fundamentals' ? 'BookOpen' : section === 'components' ? 'Layers' : 'Layout');
    setFormColor(section === 'fundamentals' ? '#6366f1' : section === 'components' ? '#10b981' : '#a855f7');
    setFormProsCons([{ aspect: '', pro: '', con: '' }]);
    setFormInterviewQA([{ q: '', a: '' }]);
  };

  const saveNote = () => {
    if (!formTitle.trim()) {
      alert('Title is required!');
      return;
    }
    if (!formContent.trim()) {
      alert('Summary is required!');
      return;
    }

    const updatedTags = formTags ? formTags.split(',').map(t => t.trim()).filter(Boolean) : [];
    const sanitizedProsCons = formProsCons.filter(pc => pc.aspect.trim() || pc.pro.trim() || pc.con.trim());
    const sanitizedQA = formInterviewQA.filter(qa => qa.q.trim() || qa.a.trim());

    const noteData = {
      id: selectedNote ? selectedNote.id : `custom-${Date.now()}`,
      title: formTitle,
      content: formContent,
      deepDive: formDeepDive,
      tags: updatedTags,
      iconName: formIconName,
      color: formColor,
      prosCons: sanitizedProsCons,
      interviewQA: sanitizedQA
    };

    if (drawerMode === 'edit') {
      if (drawerSection === 'fundamentals') {
        setFundamentals(fundamentals.map(f => f.id === selectedNote.id ? noteData : f));
      } else if (drawerSection === 'components') {
        setComponents(components.map(c => c.id === selectedNote.id ? noteData : c));
      } else if (drawerSection === 'patterns') {
        setPatterns(patterns.map(p => p.id === selectedNote.id ? noteData : p));
      }
      setSelectedNote(noteData);
      setDrawerMode('read');
    } else if (drawerMode === 'create') {
      if (drawerSection === 'fundamentals') {
        setFundamentals([...fundamentals, noteData]);
      } else if (drawerSection === 'components') {
        setComponents([...components, noteData]);
      } else if (drawerSection === 'patterns') {
        setPatterns([...patterns, noteData]);
      }
      setSelectedNote(noteData);
      setDrawerMode('read');
    }
  };

  const deleteNote = (noteId) => {
    if (window.confirm("Are you sure you want to delete this note?")) {
      if (drawerSection === 'fundamentals') {
        setFundamentals(fundamentals.filter(f => f.id !== noteId));
      } else if (drawerSection === 'components') {
        setComponents(components.filter(c => c.id !== noteId));
      } else if (drawerSection === 'patterns') {
        setPatterns(patterns.filter(p => p.id !== noteId));
      }
      setSelectedNote(null);
    }
  };

  // Dynamic Array Handlers for Forms
  const handleProConChange = (index, field, value) => {
    const updated = [...formProsCons];
    updated[index][field] = value;
    setFormProsCons(updated);
  };

  const addProConRow = () => {
    setFormProsCons([...formProsCons, { aspect: '', pro: '', con: '' }]);
  };

  const removeProConRow = (index) => {
    setFormProsCons(formProsCons.filter((_, i) => i !== index));
  };

  const handleQAChange = (index, field, value) => {
    const updated = [...formInterviewQA];
    updated[index][field] = value;
    setFormInterviewQA(updated);
  };

  const addQA = () => {
    setFormInterviewQA([...formInterviewQA, { q: '', a: '' }]);
  };

  const removeQA = (index) => {
    setFormInterviewQA(formInterviewQA.filter((_, i) => i !== index));
  };

  // ----------------------------------------------------
  // EXPORT / IMPORT / RESET UTILITIES
  // ----------------------------------------------------
  const exportNotes = () => {
    const data = { fundamentals, components, patterns };
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', 'sys_design_notes_export.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const triggerImport = () => {
    fileInputRef.current.click();
  };

  const importNotes = (event) => {
    const fileReader = new FileReader();
    fileReader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.fundamentals && data.components && data.patterns) {
          setFundamentals(data.fundamentals);
          setComponents(data.components);
          setPatterns(data.patterns);
          alert('Notes successfully imported!');
        } else {
          alert('Import failed! Missing fundamental system design nodes.');
        }
      } catch (err) {
        alert('Invalid JSON file format!');
      }
    };
    if (event.target.files && event.target.files[0]) {
      fileReader.readAsText(event.target.files[0]);
    }
  };

  const resetToDefaults = () => {
    if (window.confirm("Are you sure you want to restore baseline notes? All your edits and custom notes will be permanently overwritten!")) {
      localStorage.removeItem('sys_design_fundamentals');
      localStorage.removeItem('sys_design_components');
      localStorage.removeItem('sys_design_patterns');
      setFundamentals(defaultFundamentals);
      setComponents(defaultComponents);
      setPatterns(defaultPatterns);
      setSelectedNote(null);
      setSelectedTag(null);
      setSearchQuery('');
    }
  };

  // ----------------------------------------------------
  // INTERACTIVE CANVAS NODE CLICK LINKAGE
  // ----------------------------------------------------
  const handleCanvasNodeClick = (node) => {
    let matchedNote = null;
    const labelLower = node.label.toLowerCase();
    const descLower = node.description.toLowerCase();

    // Match in Components
    matchedNote = components.find(c => 
      c.title.toLowerCase().includes(labelLower) || 
      labelLower.includes(c.title.toLowerCase()) ||
      c.title.toLowerCase().includes(descLower) ||
      descLower.includes(c.title.toLowerCase())
    );

    // Fallbacks based on canvas node type definitions
    if (!matchedNote) {
      if (node.type === 'lb') {
        matchedNote = components.find(c => c.id === 'comp-load-balancer');
      } else if (node.type === 'db') {
        matchedNote = components.find(c => c.id === 'comp-sql-database' || c.title.toLowerCase().includes('sql'));
      } else if (node.type === 'cache') {
        matchedNote = components.find(c => c.id === 'comp-cache-redis');
      } else if (node.type === 'queue') {
        matchedNote = components.find(c => c.id === 'comp-message-queue');
      } else if (node.type === 'client') {
        matchedNote = fundamentals.find(f => f.id === 'fund-dns-resolution');
      }
    }

    if (matchedNote) {
      openNoteDetails(matchedNote, matchedNote.id.startsWith('fund') ? 'fundamentals' : 'components');
    } else {
      // Create a prompt to see if they want to create a note for this!
      if (window.confirm(`No note found matching canvas component "${node.label}". Would you like to create one under Components?`)) {
        openCreateNote('components');
        setFormTitle(node.label);
        setFormContent(node.description);
      }
    }
  };

  // ----------------------------------------------------
  // AI ARCHITECT PROMPT HANDLING
  // ----------------------------------------------------
  const handleAiDesign = () => {
    if (!aiPrompt.trim()) {
      alert('Describe the system requirements first!');
      return;
    }
    setIsDesigning(true);
    setTimeout(() => {
      setIsDesigning(false);

      const systemTitle = aiPrompt.charAt(0).toUpperCase() + aiPrompt.slice(1);
      const generatedId = `ai-gen-${Date.now()}`;

      const newAiNote = {
        id: generatedId,
        title: `${systemTitle} (AI Generated)`,
        iconName: 'Sparkles',
        color: '#a855f7',
        content: `Production-grade synthesized architecture representing requirements for: "${aiPrompt}"`,
        tags: ['AI Generated', 'Scalability', 'System Design'],
        deepDive: `This system architecture is automatically synthesized by the SysDesign.AI system architect to satisfy the requirements for: "${aiPrompt}".

### Architectural Design Overview:
1. **Traffic Entry & Edge Routing**: Incoming internet traffic hits a geo-routed CDN cluster for fast static delivery, forwarding dynamic API calls to a redundant Layer 7 Load Balancer.
2. **API Management Gateway**: Acts as the gatekeeper for user authentication, rate limiting (configured for 500 requests/sec token bucket), and SSL termination.
3. **Core Services**: Deployed as loosely-coupled microservices running inside Kubernetes pods. Communication is dynamic and managed via a service mesh (mTLS enabled).
4. **Data Tier & Persistence**:
   - Primary operations: Sharded PostgreSQL cluster running in active-passive replication.
   - Cache Layer: Redis cluster (cache-aside strategy) for high-frequency user profiles.
   - Event Stream: Kafka cluster serving as the message bus for asynchronous communication and transactional consistency.

### High Availability Configuration:
- Redundant deployment across multiple AWS Availability Zones.
- Auto-scaling policies triggered by CPU (> 75%) or queue depth (> 10,000 messages).`,
        prosCons: [
          { aspect: 'AI Scalability', pro: 'Highly scalable architecture, eliminates horizontal single points of failure.', con: 'Increased operational cost due to multi-zone replication.' }
        ],
        interviewQA: [
          { q: "What was the design reasoning behind Kafka in this system?", a: "Kafka decouples high-frequency producers from databases, smoothing traffic peaks and enabling event-driven scaling." }
        ]
      };

      // Add to Patterns and switch to it
      setPatterns(prev => [newAiNote, ...prev]);
      setActiveSection('patterns');
      setSearchQuery(`${systemTitle}`);
      openNoteDetails(newAiNote, 'patterns');
    }, 2000);
  };

  // ----------------------------------------------------
  // FILTERING LOGIC
  // ----------------------------------------------------
  const filterList = (list) => {
    return list.filter(item => {
      const matchSearch = searchQuery.trim() === '' || 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.deepDive && item.deepDive.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.tags && item.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())));
      
      const matchTag = !selectedTag || (item.tags && item.tags.includes(selectedTag));

      return matchSearch && matchTag;
    });
  };

  const activeNotesList = 
    activeSection === 'fundamentals' ? fundamentals :
    activeSection === 'components' ? components :
    activeSection === 'patterns' ? patterns : [];

  const filteredNotes = filterList(activeNotesList);

  // ----------------------------------------------------
  // MAIN COMPONENT VIEW RENDERING
  // ----------------------------------------------------
  const renderContent = () => {
    switch (activeSection) {
      case 'fundamentals':
      case 'components':
      case 'patterns':
        return (
          <div className="content-grid">
            {/* ADD CUSTOM NOTE CARD */}
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="card glass-panel add-card-dashed"
              onClick={() => openCreateNote(activeSection)}
            >
              <div className="add-icon-container">
                <Plus size={36} color="var(--accent-primary)" />
              </div>
              <h3>Add Custom Note</h3>
              <p>Create, write, and customize your own system design study sheet with deep dives, pros/cons, and key questions.</p>
            </motion.div>

            {filteredNotes.map((item, index) => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02 }}
                className="card glass-panel"
              >
                <div className="card-header-actions">
                  <div className="card-icon" style={{ backgroundColor: `${item.color || '#6366f1'}20` }}>
                    <NoteIcon name={item.iconName} size={24} color={item.color || '#6366f1'} />
                  </div>
                  {item.id.startsWith('custom-') || item.id.startsWith('ai-gen-') ? (
                    <button 
                      className="trash-btn" 
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNote(item.id);
                      }}
                      title="Delete Note"
                    >
                      <Trash2 size={16} />
                    </button>
                  ) : null}
                </div>
                <h3>{item.title}</h3>
                <p>{item.content}</p>

                {item.tags && (
                  <div className="card-tags-row">
                    {item.tags.map(tag => (
                      <span 
                        key={tag} 
                        className={`tag-chip ${selectedTag === tag ? 'active' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTag(selectedTag === tag ? null : tag);
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <button 
                  className="text-button" 
                  onClick={() => openNoteDetails(item, activeSection)}
                >
                  Learn More <ChevronRight size={16} />
                </button>
              </motion.div>
            ))}

            {filteredNotes.length === 0 && (
              <div className="empty-results-container glass-panel">
                <Search size={48} color="var(--text-secondary)" className="pulse" />
                <h3>No Matching Notes Found</h3>
                <p>Try clearing your search query or adjusting your filters to find what you are looking for.</p>
                <button 
                  className="primary-button" 
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedTag(null);
                  }}
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        );
      case 'casestudies':
        return (
          <div className="casestudy-view">
            <div className="casestudy-sidebar">
              {caseStudies.map((study, index) => (
                <button 
                  key={index} 
                  className={`study-item ${selectedCase.title === study.title ? 'active' : ''}`}
                  onClick={() => setSelectedCase(study)}
                >
                  <h4>{study.title}</h4>
                  <span>{study.company}</span>
                </button>
              ))}
              <div className="canvas-instruction glass-panel">
                <InfoIcon size={16} color="var(--accent-primary)" />
                <small><strong>Visual Linkage:</strong> Click any node in the diagram block to slide open its comprehensive system design note.</small>
              </div>
            </div>
            <div className="casestudy-content glass-panel">
              <div className="study-header">
                <h2>{selectedCase.title}</h2>
                <div className="tags">
                  {selectedCase.tags.map(tag => <span key={tag} className="tag">{tag}</span>)}
                </div>
              </div>
              <SystemDesignCanvas 
                architecture={selectedCase.architecture} 
                onNodeClick={handleCanvasNodeClick}
              />
              <div className="study-details">
                <h3>System Architecture & Constraints</h3>
                <ul>
                  <li>Scales dynamically to support millions of active concurrent users.</li>
                  <li>Ensures sub-100ms request distribution using intelligent Layer 7 Load Balancing.</li>
                  <li>Implements robust data storage using sharded, geographically replicated database instances.</li>
                </ul>
              </div>
            </div>
          </div>
        );
      case 'ai-architect':
        return (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="ai-container glass-panel"
          >
            <div className="ai-header">
              <Sparkles size={48} color="#a855f7" className="pulse" />
              <h2>System Architect AI</h2>
              <p>Harnessing artificial intelligence to synthesize production-grade systems.</p>
            </div>
            <div className="ai-chat-area">
              <div className="message bot">
                {isDesigning ? "Analyzing system constraints, calculating resource capacities and generating database topology..." : "Describe the scale, database and functionality you want to build. (e.g., 'E-commerce platform with Redis cache and RabbitMQ message broker')"}
              </div>
              {isDesigning && (
                <div className="design-loader">
                  <div className="progress-bar"><div className="progress"></div></div>
                </div>
              )}
            </div>
            {!isDesigning && (
              <div className="ai-input-area">
                <input 
                  type="text" 
                  placeholder="Describe your system requirements..." 
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAiDesign();
                  }}
                />
                <button className="primary-button" onClick={handleAiDesign}>
                  Generate Architecture <ArrowRight size={18} />
                </button>
              </div>
            )}
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="app-container">
      {/* HIDDEN FILE INPUT FOR IMPORTING NOTES */}
      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        accept=".json" 
        onChange={importNotes} 
      />

      <aside className="sidebar glass-panel">
        <div className="logo">
          <Layers size={32} color="#6366f1" />
          <span>SysDesign<span style={{color: 'var(--accent-secondary)'}}>.AI</span></span>
        </div>
        <nav>
          {sections.map((section) => (
            <button 
              key={section.id}
              className={`nav-item ${activeSection === section.id ? 'active' : ''}`}
              onClick={() => {
                setActiveSection(section.id);
                setSelectedTag(null); // Clear tag filters on navigation
              }}
            >
              <section.icon size={20} />
              <span>{section.name}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="pro-badge">MASTER SYSTEM KIT</div>
        </div>
      </aside>

      <main className="main-content">
        <header className="top-nav">
          <div className="search-bar glass-panel">
            <Search size={18} color="#94a3b8" />
            <input 
              type="text" 
              placeholder="Search concepts, tags, parameters..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="clear-search-btn" onClick={() => setSearchQuery('')}><X size={16} /></button>
            )}
          </div>

          <div className="nav-actions">
            {/* DATA BACKUP & OPERATIONS BAR */}
            <div className="backup-ops-bar glass-panel">
              <button className="action-icon-btn" onClick={exportNotes} title="Export Notes (JSON)">
                <Download size={18} />
                <span>Export</span>
              </button>
              <button className="action-icon-btn" onClick={triggerImport} title="Import Notes (JSON)">
                <Upload size={18} />
                <span>Import</span>
              </button>
              <button className="action-icon-btn reset" onClick={resetToDefaults} title="Reset Baseline Notes">
                <RefreshCw size={18} />
                <span>Reset</span>
              </button>
            </div>
            
            <button className="icon-button"><Bell size={20} /></button>
            <button className="icon-button user-profile"><User size={20} /></button>
          </div>
        </header>

        <section className="view-container">
          <header className="view-header">
            <div className="view-title-row">
              <div>
                <motion.h1
                  key={`h1-${activeSection}`}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {sections.find(s => s.id === activeSection)?.name}
                </motion.h1>
                <motion.p
                  key={`p-${activeSection}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {sections.find(s => s.id === activeSection)?.description}
                </motion.p>
              </div>
            </div>

            {/* ACTIVE TAG FILTER NOTIFICATION */}
            {selectedTag && (
              <div className="active-filter-bar glass-panel fade-in">
                <span>Filtering by Tag: <strong style={{color: 'var(--accent-secondary)'}}>{selectedTag}</strong></span>
                <button className="clear-filter-btn" onClick={() => setSelectedTag(null)}>
                  <X size={14} />
                </button>
              </div>
            )}
          </header>
          
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </section>
      </main>

      {/* ----------------------------------------------------
          RIGHT SLIDE DETAILS & EDITOR DRAWER
          ---------------------------------------------------- */}
      <AnimatePresence>
        {selectedNote || drawerMode === 'create' ? (
          <>
            {/* Translucent Backdrop blur */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="drawer-backdrop"
              onClick={() => {
                if (drawerMode === 'create') {
                  if (window.confirm("Discard changes to new note?")) setSelectedNote(null);
                } else if (drawerMode === 'edit') {
                  if (window.confirm("Discard unsaved changes?")) setDrawerMode('read');
                } else {
                  setSelectedNote(null);
                }
              }}
            />

            {/* Sliding Drawer Body */}
            <motion.div 
              initial={{ x: 600 }}
              animate={{ x: 0 }}
              exit={{ x: 600 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="drawer-panel glass-panel"
            >
              {/* Drawer Top Navigation bar */}
              <div className="drawer-nav">
                <span className="section-label">{drawerSection.toUpperCase()} SHEET</span>
                <div className="nav-group">
                  {drawerMode === 'read' && (
                    <>
                      <button className="drawer-action-btn" onClick={() => setDrawerMode('edit')}>
                        <Edit3 size={16} /> Edit Note
                      </button>
                      {(selectedNote.id.startsWith('custom-') || selectedNote.id.startsWith('ai-gen-')) && (
                        <button className="drawer-action-btn delete" onClick={() => deleteNote(selectedNote.id)}>
                          <Trash2 size={16} /> Delete
                        </button>
                      )}
                    </>
                  )}
                  <button className="close-btn" onClick={() => {
                    if (drawerMode === 'create') {
                      if (window.confirm("Discard changes to new note?")) setSelectedNote(null);
                    } else if (drawerMode === 'edit') {
                      if (window.confirm("Discard unsaved changes?")) setDrawerMode('read');
                    } else {
                      setSelectedNote(null);
                    }
                  }}>
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* DRAWER RENDER MODE: READ (CONCEPT SHEET VIEW) */}
              {drawerMode === 'read' && selectedNote && (
                <div className="drawer-content">
                  <div className="drawer-header-block" style={{ borderLeftColor: selectedNote.color || '#6366f1' }}>
                    <div className="drawer-title-row">
                      <NoteIcon name={selectedNote.iconName} size={32} color={selectedNote.color || '#6366f1'} />
                      <h2>{selectedNote.title}</h2>
                    </div>
                    <p className="summary-text">{selectedNote.content}</p>
                    
                    {selectedNote.tags && (
                      <div className="tags-row">
                        {selectedNote.tags.map(t => <span key={t} className="tag">{t}</span>)}
                      </div>
                    )}
                  </div>

                  {/* Tabs Selector */}
                  <div className="drawer-tabs">
                    <button 
                      className={`tab-btn ${activeDrawerTab === 'overview' ? 'active' : ''}`}
                      onClick={() => setActiveDrawerTab('overview')}
                    >
                      Overview Deep-Dive
                    </button>
                    {selectedNote.prosCons && selectedNote.prosCons.length > 0 && (
                      <button 
                        className={`tab-btn ${activeDrawerTab === 'tradeoffs' ? 'active' : ''}`}
                        onClick={() => setActiveDrawerTab('tradeoffs')}
                      >
                        Trade-offs & Pros/Cons
                      </button>
                    )}
                    {selectedNote.interviewQA && selectedNote.interviewQA.length > 0 && (
                      <button 
                        className={`tab-btn ${activeDrawerTab === 'qa' ? 'active' : ''}`}
                        onClick={() => setActiveDrawerTab('qa')}
                      >
                        Interview Q&As
                      </button>
                    )}
                  </div>

                  {/* Tab Render Content */}
                  <div className="drawer-pane-body">
                    {activeDrawerTab === 'overview' && (
                      <div className="pane-content overview">
                        <h3>Technical Deep-Dive</h3>
                        <div className="rich-text-pane">
                          {selectedNote.deepDive ? (
                            selectedNote.deepDive.split('\n\n').map((para, i) => {
                              if (para.startsWith('###')) {
                                return <h4 key={i} style={{ marginTop: '20px', color: 'var(--accent-secondary)' }}>{para.replace('###', '').trim()}</h4>;
                              } else if (para.startsWith('-') || para.startsWith('*')) {
                                return (
                                  <ul key={i} style={{ paddingLeft: '20px', margin: '12px 0' }}>
                                    {para.split('\n').map((li, idx) => (
                                      <li key={idx} style={{ margin: '6px 0', color: 'var(--text-secondary)' }}>
                                        {li.replace(/^[-*]\s*/, '').replace(/\*\*(.*?)\*\*/g, '$1')}
                                      </li>
                                    ))}
                                  </ul>
                                );
                              } else if (para.match(/^\d+\./)) {
                                return (
                                  <ol key={i} style={{ paddingLeft: '20px', margin: '12px 0' }}>
                                    {para.split('\n').map((li, idx) => (
                                      <li key={idx} style={{ margin: '6px 0', color: 'var(--text-secondary)' }}>
                                        {li.replace(/^\d+\.\s*/, '')}
                                      </li>
                                    ))}
                                  </ol>
                                );
                              }
                              return <p key={i}>{para}</p>;
                            })
                          ) : (
                            <p style={{fontStyle: 'italic', color: 'var(--text-secondary)'}}>No deep dive analysis documented yet. Click edit to add detailed concepts.</p>
                          )}
                        </div>
                      </div>
                    )}

                    {activeDrawerTab === 'tradeoffs' && selectedNote.prosCons && (
                      <div className="pane-content tradeoffs">
                        <h3>Architectural Trade-Off Analysis</h3>
                        <div className="pros-cons-grid">
                          {selectedNote.prosCons.map((pc, idx) => (
                            <div key={idx} className="pro-con-comparison-card glass-panel">
                              <h4 className="aspect-title">{pc.aspect}</h4>
                              <div className="pro-con-split">
                                <div className="split-side pro">
                                  <h5>ADVANTAGE / PRO</h5>
                                  <p>{pc.pro}</p>
                                </div>
                                <div className="split-side con">
                                  <h5>LIMITATION / CON</h5>
                                  <p>{pc.con}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeDrawerTab === 'qa' && selectedNote.interviewQA && (
                      <div className="pane-content qa">
                        <h3>High-Frequency Interview Questions</h3>
                        <div className="qa-accordion-list">
                          {selectedNote.interviewQA.map((qa, idx) => (
                            <details key={idx} className="qa-accordion-item glass-panel">
                              <summary className="qa-question">
                                <span>Q: {qa.q}</span>
                                <ChevronRight className="chevron-icon" size={16} />
                              </summary>
                              <div className="qa-answer">
                                <p>{qa.a}</p>
                              </div>
                            </details>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* DRAWER RENDER MODE: EDIT & CREATE FORM */}
              {(drawerMode === 'edit' || drawerMode === 'create') && (
                <div className="drawer-content form-view">
                  <h2>{drawerMode === 'create' ? `Create New ${drawerSection} Note` : `Edit Note: ${formTitle}`}</h2>
                  
                  <div className="note-form">
                    <div className="form-group">
                      <label>Note Title *</label>
                      <input 
                        type="text" 
                        value={formTitle} 
                        onChange={(e) => setFormTitle(e.target.value)} 
                        placeholder="e.g. Rate Limiting, Consistent Hashing"
                      />
                    </div>

                    <div className="form-group">
                      <label>Short Summary * (Used for Card Grid)</label>
                      <textarea 
                        rows={2}
                        value={formContent} 
                        onChange={(e) => setFormContent(e.target.value)} 
                        placeholder="Write a clear one-sentence summary of the concept..."
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group flex-1">
                        <label>Card Theme Color</label>
                        <div className="color-picker-row">
                          {['#6366f1', '#a855f7', '#10b981', '#ef4444', '#f59e0b', '#ec4899', '#06b6d4', '#eab308'].map(color => (
                            <button
                              key={color}
                              type="button"
                              className={`color-dot ${formColor === color ? 'selected' : ''}`}
                              style={{ backgroundColor: color }}
                              onClick={() => setFormColor(color)}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Lucide Icon</label>
                        <select 
                          value={formIconName} 
                          onChange={(e) => setFormIconName(e.target.value)}
                          className="icon-dropdown-select"
                        >
                          {Object.keys(IconMap).filter(name => !['ArrowRight', 'Plus', 'Trash2', 'Edit3', 'Save', 'X', 'Download', 'Upload', 'RefreshCw', 'Check', 'ExternalLink'].includes(name)).map(name => (
                            <option key={name} value={name}>{name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Tags / Parameters (Comma Separated)</label>
                      <input 
                        type="text" 
                        value={formTags} 
                        onChange={(e) => setFormTags(e.target.value)} 
                        placeholder="e.g. Distributed Lock, Replication, CAP"
                      />
                    </div>

                    <div className="form-group">
                      <label>Technical Deep-Dive Notes (Markdown Paragraphs Supported)</label>
                      <textarea 
                        rows={8}
                        value={formDeepDive} 
                        onChange={(e) => setFormDeepDive(e.target.value)} 
                        placeholder="Write dynamic and in-depth descriptions of internal working structures, algorithms, real-world topologies, and key trade-offs. Double space for new paragraphs."
                      />
                    </div>

                    {/* PROS & CONS EDITABLE ARRAY */}
                    <div className="form-group-array">
                      <div className="array-header">
                        <label>Architectural Trade-offs / Comparatives</label>
                        <button type="button" className="add-array-item-btn" onClick={addProConRow}>
                          <Plus size={14} /> Add Row
                        </button>
                      </div>
                      
                      <div className="array-list">
                        {formProsCons.map((pc, idx) => (
                          <div key={idx} className="array-row-item glass-panel">
                            <div className="row-header-actions">
                              <span>Aspect #{idx + 1}</span>
                              <button type="button" className="remove-row-btn" onClick={() => removeProConRow(idx)}>
                                <X size={14} />
                              </button>
                            </div>
                            <input 
                              type="text" 
                              value={pc.aspect} 
                              onChange={(e) => handleProConChange(idx, 'aspect', e.target.value)}
                              placeholder="Comparative aspect (e.g. Read Scaling, Write Overhead)"
                              className="aspect-input"
                            />
                            <div className="split-inputs">
                              <textarea 
                                rows={2}
                                value={pc.pro} 
                                onChange={(e) => handleProConChange(idx, 'pro', e.target.value)}
                                placeholder="Advantage (Pro)..."
                              />
                              <textarea 
                                rows={2}
                                value={pc.con} 
                                onChange={(e) => handleProConChange(idx, 'con', e.target.value)}
                                placeholder="Limitation (Con)..."
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* INTERVIEW QA EDITABLE ARRAY */}
                    <div className="form-group-array">
                      <div className="array-header">
                        <label>High-Frequency Interview Questions</label>
                        <button type="button" className="add-array-item-btn" onClick={addQA}>
                          <Plus size={14} /> Add Question
                        </button>
                      </div>
                      
                      <div className="array-list">
                        {formInterviewQA.map((qa, idx) => (
                          <div key={idx} className="array-row-item glass-panel">
                            <div className="row-header-actions">
                              <span>Question #{idx + 1}</span>
                              <button type="button" className="remove-row-btn" onClick={() => removeQA(idx)}>
                                <X size={14} />
                              </button>
                            </div>
                            <input 
                              type="text" 
                              value={qa.q} 
                              onChange={(e) => handleQAChange(idx, 'q', e.target.value)}
                              placeholder="Interview Question (e.g. How do you scale writes?)"
                              className="aspect-input"
                            />
                            <textarea 
                              rows={3}
                              value={qa.a} 
                              onChange={(e) => handleQAChange(idx, 'a', e.target.value)}
                              placeholder="Provide a comprehensive technical model answer..."
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="form-footer-actions">
                    <button className="primary-button save-note-btn" onClick={saveNote}>
                      <Save size={18} /> Save Concept Sheet
                    </button>
                    <button 
                      className="cancel-btn" 
                      onClick={() => {
                        if (drawerMode === 'create') setSelectedNote(null);
                        else setDrawerMode('read');
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

// ----------------------------------------------------
// MINI HELPER ICONS (TO PREVENT MISSING IMPORTS)
// ----------------------------------------------------
const InfoIcon = ({ size = 16, color = 'currentColor' }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10"/>
      <path d="M12 16v-4"/>
      <path d="M12 8h.01"/>
    </svg>
  );
};

export default App;
