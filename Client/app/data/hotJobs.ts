import type { Job } from "./mockJobs";

const hotJobs: Job[] = [
  {
    id: "h1",
    title: "Senior Frontend Developer",
    company: "Top Tech Corp",
    location: "Hà Nội",
    salary: "25-35 triệu VND",
    description:
      "Lead frontend development with advanced React and TypeScript skills. Experience with state management and performance optimization.",
    imageUrl: "https://via.placeholder.com/300x200?text=Hot+Job+1",
  },
  {
    id: "h2",
    title: "AI/ML Engineer",
    company: "AI Pioneers",
    location: "TP.HCM",
    salary: "30-45 triệu VND",
    description:
      "Develop cutting-edge AI models and machine learning solutions. Expertise in deep learning frameworks required.",
    imageUrl: "https://via.placeholder.com/300x200?text=Hot+Job+2",
  },
  {
    id: "h3",
    title: "Full Stack Developer",
    company: "Innovative Solutions",
    location: "Đà Nẵng",
    salary: "20-30 triệu VND",
    description:
      "Build end-to-end web applications. Proficiency in both frontend and backend technologies.",
    imageUrl: "https://via.placeholder.com/300x200?text=Hot+Job+3",
  },
  {
    id: "h4",
    title: "DevOps Specialist",
    company: "Cloud Masters",
    location: "Hà Nội",
    salary: "28-40 triệu VND",
    description:
      "Manage cloud infrastructure and CI/CD pipelines. Experience with Kubernetes and AWS.",
    imageUrl: "https://via.placeholder.com/300x200?text=Hot+Job+4",
  },
  {
    id: "h5",
    title: "Data Scientist",
    company: "Data Insights",
    location: "TP.HCM",
    salary: "25-40 triệu VND",
    description:
      "Analyze complex datasets and build predictive models. Strong statistical background essential.",
    imageUrl: "https://via.placeholder.com/300x200?text=Hot+Job+5",
  },
  {
    id: "h6",
    title: "Mobile App Developer",
    company: "App Innovators",
    location: "Hà Nội",
    salary: "22-32 triệu VND",
    description:
      "Create innovative mobile applications for iOS and Android. Experience with cross-platform development.",
    imageUrl: "https://via.placeholder.com/300x200?text=Hot+Job+6",
  },
  {
    id: "h7",
    title: "Cybersecurity Expert",
    company: "Secure Networks",
    location: "TP.HCM",
    salary: "30-45 triệu VND",
    description:
      "Protect systems from cyber threats. Knowledge of advanced security protocols and ethical hacking.",
    imageUrl: "https://via.placeholder.com/300x200?text=Hot+Job+7",
  },
  {
    id: "h8",
    title: "UI/UX Designer",
    company: "Design Leaders",
    location: "Đà Nẵng",
    salary: "18-28 triệu VND",
    description:
      "Design user-centered interfaces and experiences. Proficiency in design tools and user research.",
    imageUrl: "https://via.placeholder.com/300x200?text=Hot+Job+8",
  },
  {
    id: "h9",
    title: "Blockchain Developer",
    company: "Crypto Solutions",
    location: "Hà Nội",
    salary: "25-40 triệu VND",
    description:
      "Develop decentralized applications and smart contracts. Experience with Ethereum and Solidity.",
    imageUrl: "https://via.placeholder.com/300x200?text=Hot+Job+9",
  },
  {
    id: "h10",
    title: "Product Manager",
    company: "Product Vision",
    location: "TP.HCM",
    salary: "35-50 triệu VND",
    description:
      "Drive product strategy and roadmap. Experience in agile development and market analysis.",
    imageUrl: "https://via.placeholder.com/300x200?text=Hot+Job+10",
  },
  {
    id: "h11",
    title: "Cloud Architect",
    company: "Cloud Architects",
    location: "Hà Nội",
    salary: "40-55 triệu VND",
    description:
      "Design scalable cloud architectures. Expertise in multiple cloud platforms and microservices.",
    imageUrl: "https://via.placeholder.com/300x200?text=Hot+Job+11",
  },
  {
    id: "h12",
    title: "Data Engineer",
    company: "Big Data Co",
    location: "Đà Nẵng",
    salary: "25-35 triệu VND",
    description:
      "Build data pipelines and manage big data infrastructure. Knowledge of Hadoop and Spark.",
    imageUrl: "https://via.placeholder.com/300x200?text=Hot+Job+12",
  },
  {
    id: "h13",
    title: "Game Developer",
    company: "Game Studios Pro",
    location: "TP.HCM",
    salary: "20-35 triệu VND",
    description:
      "Create engaging video games. Experience with Unity, Unreal Engine, or Godot.",
    imageUrl: "https://via.placeholder.com/300x200?text=Hot+Job+13",
  },
  {
    id: "h14",
    title: "IoT Engineer",
    company: "Smart Devices",
    location: "Hà Nội",
    salary: "22-32 triệu VND",
    description:
      "Develop Internet of Things solutions. Knowledge of embedded systems and sensors.",
    imageUrl: "https://via.placeholder.com/300x200?text=Hot+Job+14",
  },
  {
    id: "h15",
    title: "QA Automation Engineer",
    company: "Quality Assurance Pro",
    location: "TP.HCM",
    salary: "18-28 triệu VND",
    description:
      "Automate testing processes. Experience with Selenium, Cypress, or similar tools.",
    imageUrl: "https://via.placeholder.com/300x200?text=Hot+Job+15",
  },
  {
    id: "h16",
    title: "Technical Lead",
    company: "Tech Leadership",
    location: "Đà Nẵng",
    salary: "35-50 triệu VND",
    description:
      "Lead technical teams and mentor developers. Strong coding skills and leadership experience.",
    imageUrl: "https://via.placeholder.com/300x200?text=Hot+Job+16",
  },
  {
    id: "h17",
    title: "AR/VR Developer",
    company: "Immersive Tech",
    location: "Hà Nội",
    salary: "25-40 triệu VND",
    description:
      "Create augmented and virtual reality experiences. Experience with ARKit, ARCore, or Unity VR.",
    imageUrl: "https://via.placeholder.com/300x200?text=Hot+Job+17",
  },
  {
    id: "h18",
    title: "Security Researcher",
    company: "Cyber Research",
    location: "TP.HCM",
    salary: "30-45 triệu VND",
    description:
      "Research and analyze security vulnerabilities. Background in computer science and cryptography.",
    imageUrl: "https://via.placeholder.com/300x200?text=Hot+Job+18",
  },
  {
    id: "h19",
    title: "Backend Architect",
    company: "System Architects",
    location: "Hà Nội",
    salary: "35-50 triệu VND",
    description:
      "Design scalable backend systems. Expertise in distributed systems and high-performance architectures.",
    imageUrl: "https://via.placeholder.com/300x200?text=Hot+Job+19",
  },
  {
    id: "h20",
    title: "Frontend Architect",
    company: "UI Architects",
    location: "TP.HCM",
    salary: "30-45 triệu VND",
    description:
      "Architect frontend applications. Deep knowledge of modern web technologies and performance optimization.",
    imageUrl: "https://via.placeholder.com/300x200?text=Hot+Job+20",
  },
  {
    id: "h21",
    title: "Machine Learning Researcher",
    company: "AI Research Lab",
    location: "Đà Nẵng",
    salary: "35-50 triệu VND",
    description:
      "Conduct advanced research in machine learning. PhD in AI/ML or related field preferred.",
    imageUrl: "https://via.placeholder.com/300x200?text=Hot+Job+21",
  },
  {
    id: "h22",
    title: "Site Reliability Engineer",
    company: "Reliable Systems",
    location: "Hà Nội",
    salary: "28-40 triệu VND",
    description:
      "Ensure system reliability and performance. Experience with monitoring tools and incident response.",
    imageUrl: "https://via.placeholder.com/300x200?text=Hot+Job+22",
  },
  {
    id: "h23",
    title: "Embedded Software Engineer",
    company: "Hardware Integrators",
    location: "TP.HCM",
    salary: "20-30 triệu VND",
    description:
      "Develop software for embedded systems. Knowledge of C/C++ and real-time operating systems.",
    imageUrl: "https://via.placeholder.com/300x200?text=Hot+Job+23",
  },
  {
    id: "h24",
    title: "Platform Engineer",
    company: "Platform Builders",
    location: "Hà Nội",
    salary: "30-45 triệu VND",
    description:
      "Build and maintain development platforms. Experience with infrastructure as code and containerization.",
    imageUrl: "https://via.placeholder.com/300x200?text=Hot+Job+24",
  },
  {
    id: "h25",
    title: "Chief Technology Officer",
    company: "Tech Visionaries",
    location: "TP.HCM",
    salary: "60-100 triệu VND",
    description:
      "Lead technology strategy and innovation. Extensive experience in tech leadership and business strategy.",
    imageUrl: "https://via.placeholder.com/300x200?text=Hot+Job+25",
  },
];

export default hotJobs;
