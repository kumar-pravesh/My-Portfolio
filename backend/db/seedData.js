import db from "./index.js";
import { generateReferenceId } from "./referenceId.js";

export async function seedInitialData() {
  const client = await db.pool.connect();
  try {
    console.log("🌱 Checking and seeding initial portfolio content...");

    // ── 1. Seed Services ──────────────────────────────────────────────
    const serviceCount = await client.query(`SELECT COUNT(*) FROM services`);
    if (parseInt(serviceCount.rows[0].count) === 0) {
      console.log("Inserting default Services...");
      const services = [
        {
          name: "Full-Stack Web Development",
          slug: "full-stack-web-development",
          short_description:
            "End-to-end, high-performance web applications built with React 19, Java 21 Spring Boot, and robust cloud architecture.",
          full_description:
            "Building modern, enterprise-grade web applications with a focus on responsiveness, intuitive UI/UX, seamless RESTful APIs, and scalable PostgreSQL database design.",
          icon: "Code",
          features: [
            "React 19 & Next.js",
            "Java 21 & Spring Boot",
            "PostgreSQL & Redis Caching",
            "Responsive UI & Tailwind CSS",
          ],
          technologies: [
            "React",
            "Java 21",
            "Spring Boot",
            "PostgreSQL",
            "Tailwind CSS",
          ],
          display_order: 1,
          is_featured: true,
          status: "published",
          visibility: "public",
        },
        {
          name: "Enterprise Microservices Architecture",
          slug: "enterprise-microservices-architecture",
          short_description:
            "Designing scalable, resilient microservices with Spring Cloud, Kafka event-driven messaging, and OAuth2 security.",
          full_description:
            "Architecting distributed microservices ecosystems configured with centralized API Gateways, circuit breakers, event streaming, and zero-trust authentication.",
          icon: "Server",
          features: [
            "Spring Cloud & API Gateways",
            "Kafka & Event Streaming",
            "OAuth2 / JWT Security",
            "Docker & Kubernetes Deployment",
          ],
          technologies: [
            "Java 21",
            "Spring Cloud",
            "Apache Kafka",
            "Docker",
            "Kubernetes",
          ],
          display_order: 2,
          is_featured: true,
          status: "published",
          visibility: "public",
        },
        {
          name: "Cloud Infrastructure & DevOps",
          slug: "cloud-infrastructure-devops",
          short_description:
            "Automating CI/CD pipelines, container orchestration, and multi-region cloud deployments with zero downtime.",
          full_description:
            "Streamlining software delivery with automated testing, GitHub Actions CI/CD workflows, containerization, and real-time observability.",
          icon: "Cloud",
          features: [
            "AWS & Cloud Infrastructure",
            "Docker & Kubernetes Orchestration",
            "GitHub Actions CI/CD",
            "Monitoring with Prometheus & Grafana",
          ],
          technologies: [
            "AWS",
            "Docker",
            "Kubernetes",
            "GitHub Actions",
            "Prometheus",
          ],
          display_order: 3,
          is_featured: true,
          status: "published",
          visibility: "public",
        },
        {
          name: "Database Optimization & API Tuning",
          slug: "database-optimization-api-tuning",
          short_description:
            "Optimizing PostgreSQL database queries, indexing strategies, connection pooling, and REST/GraphQL performance.",
          full_description:
            "Deep database tuning, deadlocks elimination, connection pool scaling, and query optimization for high-throughput transactional platforms.",
          icon: "Database",
          features: [
            "PostgreSQL & Neon DB Tuning",
            "RESTful & GraphQL API Design",
            "Database Migration & Indexing",
            "Real-Time WebSocket Feeds",
          ],
          technologies: [
            "PostgreSQL",
            "Neon DB",
            "Redis",
            "GraphQL",
            "WebSockets",
          ],
          display_order: 4,
          is_featured: false,
          status: "published",
          visibility: "public",
        },
      ];

      for (const s of services) {
        const refId = await generateReferenceId("SERV", new Date(), client);
        await client.query(
          `INSERT INTO services (
            reference_id, name, slug, short_description, full_description, icon, features, technologies, display_order, is_featured, status, visibility, published_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())`,
          [
            refId,
            s.name,
            s.slug,
            s.short_description,
            s.full_description,
            s.icon,
            s.features,
            s.technologies,
            s.display_order,
            s.is_featured,
            s.status,
            s.visibility,
          ],
        );
      }
      console.log("✅ Services seeded successfully.");
    }

    // ── 2. Seed Projects ──────────────────────────────────────────────
    const projectCount = await client.query(`SELECT COUNT(*) FROM projects`);
    if (parseInt(projectCount.rows[0].count) === 0) {
      console.log("Inserting default Projects...");
      const projects = [
        {
          title: "Nexus Enterprise Workspace Platform",
          slug: "nexus-enterprise-workspace-platform",
          short_description:
            "A collaborative digital workspace and asset management ecosystem powered by Java 21, Spring Boot, and React.",
          full_description:
            "Nexus is a unified workspace platform featuring automated document tagging, real-time collaboration, role-based access controls, and analytics dashboards.",
          category: "Full Stack",
          tech_stack: [
            "Java 21",
            "Spring Boot",
            "React",
            "PostgreSQL",
            "Tailwind CSS",
          ],
          hero_image:
            "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
          github_url: "https://github.com/kumar-pravesh/nexus-platform",
          display_order: 1,
          is_featured: true,
          status: "published",
          visibility: "public",
        },
        {
          title: "Clinixa Healthcare Portal",
          slug: "clinixa-healthcare-portal",
          short_description:
            "HIPAA-compliant patient record management system serving over 500,000 active patient profiles.",
          full_description:
            "Comprehensive medical practice portal supporting online appointment scheduling, telehealth integrations, electronic health records, and secure medical billing.",
          category: "Healthcare",
          tech_stack: [
            "Java 21",
            "Spring Security",
            "React",
            "PostgreSQL",
            "Docker",
          ],
          hero_image:
            "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80",
          github_url: "https://github.com/kumar-pravesh/clinixa-portal",
          display_order: 2,
          is_featured: true,
          status: "published",
          visibility: "public",
        },
        {
          title: "OmniPay Fintech Payment Gateway",
          slug: "omnipay-fintech-payment-gateway",
          short_description:
            "High-throughput real-time payment processing platform executing 10,000+ transactions per second.",
          full_description:
            "Fintech transaction processing engine built on event-driven microservices architecture with Apache Kafka, Redis caching, and automated audit logging.",
          category: "Fintech",
          tech_stack: [
            "Spring Boot",
            "Apache Kafka",
            "Redis",
            "React",
            "Neon DB",
          ],
          hero_image:
            "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80",
          github_url: "https://github.com/kumar-pravesh/omnipay-gateway",
          display_order: 3,
          is_featured: true,
          status: "published",
          visibility: "public",
        },
      ];

      for (const p of projects) {
        const refId = await generateReferenceId("PROJ", new Date(), client);
        await client.query(
          `INSERT INTO projects (
            reference_id, title, slug, short_description, full_description, category, tech_stack, hero_image, github_url, display_order, is_featured, status, visibility, published_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())`,
          [
            refId,
            p.title,
            p.slug,
            p.short_description,
            p.full_description,
            p.category,
            p.tech_stack,
            p.hero_image,
            p.github_url,
            p.display_order,
            p.is_featured,
            p.status,
            p.visibility,
          ],
        );
      }
      console.log("✅ Projects seeded successfully.");
    }

    // ── 3. Seed Case Studies ──────────────────────────────────────────
    const caseCount = await client.query(`SELECT COUNT(*) FROM case_studies`);
    if (parseInt(caseCount.rows[0].count) === 0) {
      console.log("Inserting default Case Studies...");
      const caseStudies = [
        {
          title: "Scaling Clinixa Medical Portal to 500k Patients",
          slug: "scaling-clinixa-medical-portal-500k-patients",
          client: "Clinixa Health Networks",
          industry: "Healthcare",
          short_description:
            "Architecting a multi-tenant medical portal with 99.99% uptime and sub-100ms API query latencies.",
          business_challenge:
            "Legacy portal suffered severe database deadlocks and slow page loads during morning peak registration hours.",
          solution_overview:
            "Migrated monolithic infrastructure to Spring Boot microservices with Redis caching layer and connection pool optimization.",
          results_summary:
            "Reduced API response times by 85% and achieved 99.99% operational availability across 500k patient records.",
          performance_improvements:
            "API latency reduced from 1.2s to 95ms. Zero downtime during peak hours.",
          cover_image:
            "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80",
          technologies: [
            "Java 21",
            "Spring Boot",
            "PostgreSQL",
            "Redis",
            "Docker",
          ],
          display_order: 1,
          is_featured: true,
          status: "published",
          visibility: "public",
        },
        {
          title: "OmniPay High-Frequency Event Streaming Architecture",
          slug: "omnipay-high-frequency-event-streaming-architecture",
          client: "OmniPay Financial",
          industry: "Fintech",
          short_description:
            "Replacing legacy monolith with Kafka event-driven microservices for instant transaction verification.",
          business_challenge:
            "Payment processing bottlenecks caused checkout timeouts for enterprise e-commerce merchants.",
          solution_overview:
            "Implemented Apache Kafka event streaming coupled with Spring Boot reactive pipelines and Redis distributed locking.",
          results_summary:
            "Achieved sub-50ms transaction verification speed and supported 10,000+ peak concurrent checkouts.",
          performance_improvements:
            "Transaction processing speed increased by 300%. Merchant checkout abandonment decreased by 40%.",
          cover_image:
            "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80",
          technologies: ["Spring Boot", "Apache Kafka", "Redis", "PostgreSQL"],
          display_order: 2,
          is_featured: true,
          status: "published",
          visibility: "public",
        },
        {
          title: "Nexus Enterprise Cloud Migration & Security Hardening",
          slug: "nexus-enterprise-cloud-migration-security-hardening",
          client: "Sivion Global Technologies",
          industry: "SaaS / Enterprise",
          short_description:
            "Re-architecting digital asset storage and role-based access control across enterprise teams.",
          business_challenge:
            "Unstructured file storage across legacy servers resulted in compliance audit risks and slow asset retrieval.",
          solution_overview:
            "Deployed centralized OAuth2/JWT security middleware with encrypted AWS S3 document vault and Neon PostgreSQL metadata indexing.",
          results_summary:
            "Passed SOC-2 compliance with zero security findings and streamlined collaboration across international developer teams.",
          performance_improvements:
            "File access speeds improved 4x with 100% audit logging compliance.",
          cover_image:
            "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
          technologies: ["React", "Java 21", "AWS S3", "PostgreSQL", "OAuth2"],
          display_order: 3,
          is_featured: true,
          status: "published",
          visibility: "public",
        },
      ];

      for (const c of caseStudies) {
        const refId = await generateReferenceId("CASE", new Date(), client);
        await client.query(
          `INSERT INTO case_studies (
            reference_id, title, slug, client, industry, short_description, business_challenge, solution_overview, results_summary, performance_improvements, cover_image, technologies, display_order, is_featured, status, visibility, published_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW())`,
          [
            refId,
            c.title,
            c.slug,
            c.client,
            c.industry,
            c.short_description,
            c.business_challenge,
            c.solution_overview,
            c.results_summary,
            c.performance_improvements,
            c.cover_image,
            c.technologies,
            c.display_order,
            c.is_featured,
            c.status,
            c.visibility,
          ],
        );
      }
      console.log("✅ Case Studies seeded successfully.");
    }

    // ── 4. Seed Blog Posts ────────────────────────────────────────────
    const blogCount = await client.query(`SELECT COUNT(*) FROM blog_posts`);
    if (parseInt(blogCount.rows[0].count) === 0) {
      console.log("Inserting default Blog Posts...");
      const blogs = [
        {
          title:
            "Mastering Java 21 Virtual Threads & High-Concurrency Microservices",
          slug: "mastering-java-21-virtual-threads-high-concurrency-microservices",
          category: "Backend",
          excerpt:
            "An in-depth guide on how Virtual Threads in Java 21 reduce memory footprint and dramatically increase request throughput.",
          content: `Java 21 introduces Virtual Threads (Project Loom), revolutionizing how JVM applications handle concurrent I/O. In traditional thread-per-request models, each HTTP request consumes a OS-level platform thread, bottlenecking application scaling under heavy traffic.

Virtual Threads are lightweight threads managed directly by the JVM rather than the operating system. With virtual threads, an application can execute millions of concurrent requests with minimal RAM overhead.

### Key Benefits of Virtual Threads:
1. **High Throughput**: Process thousands of concurrent database queries without thread starvation.
2. **Simplified Code**: Write intuitive synchronous code without complex reactive programming boilerplate.
3. **Seamless Integration**: Drop-in compatible with existing Spring Boot 3.2+ applications.`,
          featured_image:
            "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80",
          author_name: "Pravesh Kumar",
          reading_time: "6 min read",
          tags: ["Java 21", "Spring Boot", "Microservices", "Concurrency"],
          display_order: 1,
          is_featured: true,
          status: "published",
          visibility: "public",
        },
        {
          title:
            "Building Scalable Single Source of Truth Architecture with React & Node",
          slug: "building-scalable-single-source-of-truth-architecture-react-node",
          category: "Full Stack",
          excerpt:
            "How to decouple public web portals from internal Admin Dashboards using a unified PostgreSQL database layer.",
          content: `Maintaining static client interfaces alongside dynamic CMS portals often leads to state drift and duplicate data. Establishing a Single Source of Truth architecture ensures that all public content (Projects, Case Studies, Blogs, Services) is driven dynamically from the Admin Dashboard.

### Core Architectural Patterns:
- **Unified PostgreSQL Schema**: Shared tables with role-based access control.
- **Server-Side Filtering & Constraints**: Public endpoints enforce status='published' and visibility='public' while supporting parameters like limit=3.
- **Responsive Layout Grids**: Modern CSS grid patterns that automatically adapt to dynamic content payloads.`,
          featured_image:
            "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80",
          author_name: "Pravesh Kumar",
          reading_time: "5 min read",
          tags: ["React", "Node.js", "PostgreSQL", "CMS"],
          display_order: 2,
          is_featured: true,
          status: "published",
          visibility: "public",
        },
        {
          title: "Event-Driven Microservices with Apache Kafka & Spring Boot",
          slug: "event-driven-microservices-apache-kafka-spring-boot",
          category: "Architecture",
          excerpt:
            "Learn how event streaming decouples enterprise backend services and guarantees data consistency across distributed systems.",
          content: `In modern distributed enterprise platforms, synchronous REST calls between microservices introduce cascade failures. Apache Kafka provides a resilient event log that enables asynchronous communication.

By publishing domain events to Kafka topics, downstream microservices consume messages at their own pace without blocking primary user request flows.`,
          featured_image:
            "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80",
          author_name: "Pravesh Kumar",
          reading_time: "8 min read",
          tags: ["Kafka", "Spring Boot", "Architecture", "Cloud"],
          display_order: 3,
          is_featured: true,
          status: "published",
          visibility: "public",
        },
      ];

      for (const b of blogs) {
        const refId = await generateReferenceId("BLOG", new Date(), client);
        await client.query(
          `INSERT INTO blog_posts (
            reference_id, title, slug, category, excerpt, content, featured_image, author_name, reading_time, tags, display_order, is_featured, status, visibility, published_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW())`,
          [
            refId,
            b.title,
            b.slug,
            b.category,
            b.excerpt,
            b.content,
            b.featured_image,
            b.author_name,
            b.reading_time,
            b.tags,
            b.display_order,
            b.is_featured,
            b.status,
            b.visibility,
          ],
        );
      }
      console.log("✅ Blog Posts seeded successfully.");
    }

    // ── 5. Seed Testimonials ──────────────────────────────────────────
    const testCount = await client.query(`SELECT COUNT(*) FROM testimonials`);
    if (parseInt(testCount.rows[0].count) === 0) {
      console.log("Inserting default Testimonials...");
      const testimonials = [
        {
          client_name: "Sarah Jenkins",
          designation: "VP of Product",
          company: "Sivion Global Technologies",
          testimonial:
            "Pravesh delivered our enterprise portal on time with exceptional code quality and high performance. His deep expertise in Spring Boot microservices and React transformed our platform scalability.",
          rating: 5,
          display_order: 1,
          is_featured: true,
          status: "published",
          visibility: "public",
        },
        {
          client_name: "David Miller",
          designation: "Chief Technology Officer",
          company: "Clinixa Healthcare Networks",
          testimonial:
            "Working with Pravesh on our healthcare management platform was seamless. He restructured our API layer to eliminate latency and implemented rock-solid security compliance.",
          rating: 5,
          display_order: 2,
          is_featured: true,
          status: "published",
          visibility: "public",
        },
        {
          client_name: "Elena Rostova",
          designation: "Lead Systems Architect",
          company: "OmniPay Financial",
          testimonial:
            "Pravesh’s architecture skills in Java 21, Kafka event streaming, and PostgreSQL tuning made a massive difference to our payment gateway throughput. Highly recommended!",
          rating: 5,
          display_order: 3,
          is_featured: true,
          status: "published",
          visibility: "public",
        },
      ];

      for (const t of testimonials) {
        const refId = await generateReferenceId("TEST", new Date(), client);
        await client.query(
          `INSERT INTO testimonials (
            reference_id, client_name, designation, company, testimonial, rating, display_order, is_featured, status, visibility, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())`,
          [
            refId,
            t.client_name,
            t.designation,
            t.company,
            t.testimonial,
            t.rating,
            t.display_order,
            t.is_featured,
            t.status,
            t.visibility,
          ],
        );
      }
      console.log("✅ Testimonials seeded successfully.");
    }

    // ── 6. Seed Media Assets ──────────────────────────────────────────
    const mediaCount = await client.query(`SELECT COUNT(*) FROM media_assets`);
    if (parseInt(mediaCount.rows[0].count) === 0) {
      console.log("Inserting default Media Assets...");
      const mediaItems = [
        {
          title: "Clinixa Portal System Architecture",
          media_type: "image",
          file_url:
            "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80",
          thumbnail_url:
            "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80",
          description:
            "High-resolution architecture diagram and UI dashboard preview for Clinixa Healthcare.",
          category: "Architecture",
          display_order: 1,
          is_featured: true,
          status: "published",
          visibility: "public",
        },
        {
          title: "OmniPay Kafka Event Pipeline",
          media_type: "image",
          file_url:
            "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80",
          thumbnail_url:
            "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=600&q=80",
          description: "Event-driven transaction processing topology diagram.",
          category: "Diagrams",
          display_order: 2,
          is_featured: true,
          status: "published",
          visibility: "public",
        },
        {
          title: "Nexus Enterprise Workspace Interface",
          media_type: "image",
          file_url:
            "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
          thumbnail_url:
            "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80",
          description:
            "Interactive preview of the Nexus workspace and analytics engine.",
          category: "UI Designs",
          display_order: 3,
          is_featured: true,
          status: "published",
          visibility: "public",
        },
      ];

      for (const m of mediaItems) {
        const refId = await generateReferenceId("MEDI", new Date(), client);
        await client.query(
          `INSERT INTO media_assets (
            reference_id, title, media_type, file_url, thumbnail_url, description, category, display_order, is_featured, status, visibility, published_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())`,
          [
            refId,
            m.title,
            m.media_type,
            m.file_url,
            m.thumbnail_url,
            m.description,
            m.category,
            m.display_order,
            m.is_featured,
            m.status,
            m.visibility,
          ],
        );
      }
      console.log("✅ Media Assets seeded successfully.");
    }
  } catch (err) {
    console.error("❌ Error during initial data seeding:", err);
  } finally {
    client.release();
  }
}
