
// import ProfileCard from "./Component/ProfileCard";
// import MyImage from "./assets/myPic.png";
// function App() {
//   return (
//     <ProfileCard
//       image={MyImage}
//       name="Arbaz khan"
//       role="Frontend Developer Trainee"
//       bio="Passionate about building clean, accessible UIs. Currently learning React and Tailwind CSS."
//       email="arbazkhan@gmail.com"
//       phone="+91 98765 43210"
//     />
//   );
// }

// export default App;


// =============================DAY 2 TASK LANDING PAGE ============================================


// import React from 'react';
// import Navbar from "./Components/NavBarComponent";
// import HeroSection from "./Components/HeroComponent";
// import Service from "./Components/ServicesComponent";
// import Footer from "./Components/FooterComponent";
// import ButtonComponent from "./Components/ButtonComponent";



// export default function App() {

//    const services = [
//     {
//       icon: "🌐",
//       title: "Web Development",
//       description:
//         "Build modern, responsive, and scalable websites using the latest technologies.",
//     },
//     {
//       icon: "📱",
//       title: "Mobile Application",
//       description:
//         "Develop high-performance Android and iOS applications for businesses.",
//     },
//     {
//       icon: "🎨",
//       title: "UI/UX Design",
//       description:
//         "Create attractive and user-friendly interfaces for the best user experience.",
//     },
//   ];
//   return (
//     <div>
//      <Navbar/> 
//      <HeroSection  getProp="Get Started" learnProp="Learn More"/>
//      <Service   services={services}/>
//      <Footer/>
//      {/* <ButtonComponent  className="hidden"/> */}
//     </div>
//   )
// }


// day 3 is pending=======================================================


// import React, { useState } from "react";
// import Navbar from "./Day-3-task/components/Navbar";
// import SearchBar from "./Day-3-task/components/SearchBar";
// import EmployeeCard from "./Day-3-task/components/EmployeeCard";
// import DepartmentFilter from "./Day-3-task/components/DepartmentFilter";
// import EmployeesData from "./Day-3-task/data/employees"

// export default function App() {
//   // ---------- STATE (Part 1) ----------
 
//   const [employees, setEmployees] = useState(EmployeesData);

//   const [searchText, setSearchText] = useState("");

  
//   const [selectedDepartment, setSelectedDepartment] = useState("All");

 
//   const [darkMode, setDarkMode] = useState(false);


//   const toggleDarkMode = () => setDarkMode(!darkMode);

  
//   const toggleStatus = (id) => {
//     setEmployees(
//       employees.map((emp) =>
//         emp.id === id
//           ? { ...emp, status: emp.status === "Active" ? "Inactive" : "Active" }
//           : emp
//       )
//     );
//   };

//   // ---------- DERIVED DATA ----------

//   const filteredEmployees = employees.filter((emp) => {
//     const matchesSearch = emp.name
//       .toLowerCase()
//       .includes(searchText.toLowerCase());

//     const matchesDept =
//       selectedDepartment === "All" || emp.department === selectedDepartment;

//     return matchesSearch && matchesDept;
//   });

//   // ---------- RENDER ----------
//   return (
//     <div
//       className={`min-h-screen transition-colors duration-300 ${
//         darkMode ? "bg-gray-900" : "bg-gray-100"
//       }`}
//     >
//       <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

//       <SearchBar
//         searchText={searchText}
//         setSearchText={setSearchText}
//         darkMode={darkMode}
//       />

//       <DepartmentFilter
//         selectedDepartment={selectedDepartment}
//         setSelectedDepartment={setSelectedDepartment}
//         darkMode={darkMode}
//       />

     
//       <EmployeeCard
//         employees={filteredEmployees}
//         toggleStatus={toggleStatus}
//         darkMode={darkMode}
//       />
//     </div>
//   );
// }





// day4 =======================================================================


// import React, { useState } from "react";
// import EmployeeForm from "./Task-day-4/Components/EmployeeForm";
// import EmployeeTable from "./Task-day-4/Components/EmployeeTable";
// import EmployeeCard from "./Task-day-4/Components/EmployeeCard";
// import SearchBar from "./Task-day-4/Components/SearchBar";
// import SortDropdown from "./Task-day-4/Components/SortDropdown";
// import Dashboard from "./Task-day-4/Components/Dashboad";

// export default function App() {

//  const [employees, setEmployees] = useState([
//    {
//     empId: "EMP001",
//     name: "Arjun Reddy",
//     email: "arjun1@gmail.com",
//     phone: "9876543210",
//     department: "IT",
//     designation: "Frontend Developer",
//     experience: 2,
//     joiningDate: "2023-01-10",
//     status: "Active",
//     image:"",
//   },
//   {
//     empId: "EMP002",
//     name: "Sneha Sharma",
//     email: "sneha2@gmail.com",
//     phone: "9876543211",
//     department: "HR",
//     designation: "HR Manager",
//     experience: 5,
//     joiningDate: "2022-03-15",
//     status: "Inactive",

//     image:"",
//   },
//   {
//     empId: "EMP003",
//     name: "Ravi Kumar",
//     email: "ravi3@gmail.com",
//     phone: "9876543212",
//     department: "Finance",
//     designation: "Accountant",
//     experience: 3,
//     joiningDate: "2021-07-20",
//     status: "Active",
//     image:"",
//   },
//   {
//     empId: "EMP004",
//     name: "Priya Singh",
//     email: "priya4@gmail.com",
//     phone: "9876543213",
//     department: "IT",
//     designation: "Backend Developer",
//     experience: 4,
//     joiningDate: "2020-11-12",
//     status: "Inactive",
//     image:"",
//   },
//   {
//     empId: "EMP005",
//     name: "Amit Verma",
//     email: "amit5@gmail.com",
//     phone: "9876543214",
//     department: "Sales",
//     designation: "Sales Executive",
//     experience: 1,
//     joiningDate: "2024-02-01",
//     status: "Active",
//     image:"",
//   },

//   {
//     empId: "EMP006",
//     name: "Neha Gupta",
//     email: "neha6@gmail.com",
//     phone: "9876543215",
//     department: "Marketing",
//     designation: "SEO Specialist",
//     experience: 3,
//     joiningDate: "2022-05-18",
//     status: "Active",
//     image:"",
//   },
//   {
//     empId: "EMP007",
//     name: "Vikram Singh",
//     email: "vikram7@gmail.com",
//     phone: "9876543216",
//     department: "IT",
//     designation: "Full Stack Developer",
//     experience: 6,
//     joiningDate: "2020-02-10",
//     status: "Active",
//     image:"",
//   },
//   {
//     empId: "EMP008",
//     name: "Pooja Mehta",
//     email: "pooja8@gmail.com",
//     phone: "9876543217",
//     department: "HR",
//     designation: "Recruiter",
//     experience: 2,
//     joiningDate: "2023-06-01",
//     status: "Active",
//     image:"",
//   },
//   {
//     empId: "EMP009",
//     name: "Rahul Das",
//     email: "rahul9@gmail.com",
//     phone: "9876543218",
//     department: "Finance",
//     designation: "Financial Analyst",
//     experience: 4,
//     joiningDate: "2021-09-12",
//     status: "Active",
//     image:"",
//   },
//   {
//     empId: "EMP010",
//     name: "Karan Patel",
//     email: "karan10@gmail.com",
//     phone: "9876543219",
//     department: "Sales",
//     designation: "Sales Manager",
//     experience: 5,
//     joiningDate: "2020-12-20",
//     status: "Active",
//     image:"",
//   },

//   {
//     empId: "EMP011",
//     name: "Anjali Verma",
//     email: "anjali11@gmail.com",
//     phone: "9876543220",
//     department: "IT",
//     designation: "Backend Developer",
//     experience: 3,
//     joiningDate: "2022-01-15",
//     status: "Active",
//     image:"",
//   },
//   {
//     empId: "EMP012",
//     name: "Suresh Yadav",
//     email: "suresh12@gmail.com",
//     phone: "9876543221",
//     department: "Support",
//     designation: "Support Engineer",
//     experience: 2,
//     joiningDate: "2023-03-10",
//     status: "Inactive",
//     image:"",
//   },
//   {
//     empId: "EMP013",
//     name: "Meera Nair",
//     email: "meera13@gmail.com",
//     phone: "9876543222",
//     department: "HR",
//     designation: "HR Executive",
//     experience: 4,
//     joiningDate: "2021-08-05",
//     status: "Active",
//     image:"",
//   },
//   {
//     empId: "EMP014",
//     name: "Rohit Sharma",
//     email: "rohit14@gmail.com",
//     phone: "9876543223",
//     department: "IT",
//     designation: "DevOps Engineer",
//     experience: 6,
//     joiningDate: "2019-04-18",
//     status: "Active",
//     image:"",
//   },
//   {
//     empId: "EMP015",
//     name: "Simran Kaur",
//     email: "simran15@gmail.com",
//     phone: "9876543224",
//     department: "Marketing",
//     designation: "Content Writer",
//     experience: 2,
//     joiningDate: "2023-07-22",
//     status: "Active",
//     image:"",
//   },

//   {
//     empId: "EMP016",
//     name: "Aman Gupta",
//     email: "aman16@gmail.com",
//     phone: "9876543225",
//     department: "Sales",
//     designation: "Sales Executive",
//     experience: 1,
//     joiningDate: "2024-01-10",
//     status: "Active",
//     image:"",
//   },
  
//   {
//     empId: "EMP017",
//     name: "Neeraj Singh",
//     email: "neeraj17@gmail.com",
//     phone: "9876543226",
//     department: "Finance",
//     designation: "Account Manager",
//     experience: 5,
//     joiningDate: "2020-06-11",
//     status: "Inactive",
//     image:"",
//   },
//   {
//     empId: "EMP018",
//     name: "Divya Sharma",
//     email: "divya18@gmail.com",
//     phone: "9876543227",
//     department: "HR",
//     designation: "HR Manager",
//     experience: 7,
//     joiningDate: "2019-09-09",
//     status: "Active",
//     image:"",
//   },
//   {
//     empId: "EMP019",
//     name: "Yash Jain",
//     email: "yash19@gmail.com",
//     phone: "9876543228",
//     department: "IT",
//     designation: "Frontend Developer",
//     experience: 3,
//     joiningDate: "2022-11-20",
//     status: "Active",
//     image:"",
//   },
//   {
//     empId: "EMP020",
//     name: "Kavya Reddy",
//     email: "kavya20@gmail.com",
//     phone: "9876543229",
//     department: "Marketing",
//     designation: "Digital Marketer",
//     experience: 4,
//     joiningDate: "2021-05-15",
//     status: "Active",
//     image:"",
//   },{
//   empId: "EMP021",
//   name: "Isha Malhotra",
//   email: "isha21@gmail.com",
//   phone: "9876543230",
//   department: "IT",
//   designation: "Frontend Developer",
//   experience: 2,
//   joiningDate: "2023-04-12",
//   status: "Active",
//   image:"",
// },
// {
//   empId: "EMP022",
//   name: "Harsh Vardhan",
//   email: "harsh22@gmail.com",
//   phone: "9876543231",
//   department: "Finance",
//   designation: "Accountant",
//   experience: 3,
//   joiningDate: "2022-08-19",
//   status: "Active",
//   image:"",
// },
// {
//   empId: "EMP023",
//   name: "Ritika Agarwal",
//   email: "ritika23@gmail.com",
//   phone: "9876543232",
//   department: "HR",
//   designation: "HR Executive",
//   experience: 2,
//   joiningDate: "2023-02-14",
//   status: "Active",
//   image:"",
// },
// {
//   empId: "EMP024",
//   name: "Sanjay Kumar",
//   email: "sanjay24@gmail.com",
//   phone: "9876543233",
//   department: "Sales",
//   designation: "Sales Executive",
//   experience: 1,
//   joiningDate: "2024-03-11",
//   status: "Active",
//   image:"",
// },
// {
//   empId: "EMP025",
//   name: "Nikhil Sharma",
//   email: "nikhil25@gmail.com",
//   phone: "9876543234",
//   department: "IT",
//   designation: "Backend Developer",
//   experience: 4,
//   joiningDate: "2021-10-05",
//   status: "Inactive", // ✔ only one extra inactive
//   image:"",
// },

// {
//   empId: "EMP026",
//   name: "Pallavi Singh",
//   email: "pallavi26@gmail.com",
//   phone: "9876543235",
//   department: "Marketing",
//   designation: "SEO Specialist",
//   experience: 3,
//   joiningDate: "2022-06-18",
//   status: "Active",
//   image:"",
// },
// {
//   empId: "EMP027",
//   name: "Manish Yadav",
//   email: "manish27@gmail.com",
//   phone: "9876543236",
//   department: "IT",
//   designation: "Full Stack Developer",
//   experience: 5,
//   joiningDate: "2020-09-25",
//   status: "Active",
//   image:"",
// },
// {
//   empId: "EMP028",
//   name: "Kiran Rao",
//   email: "kiran28@gmail.com",
//   phone: "9876543237",
//   department: "HR",
//   designation: "Recruiter",
//   experience: 2,
//   joiningDate: "2023-07-09",
//   status: "Active",
//   image:"",
// },
// {
//   empId: "EMP029",
//   name: "Deepak Verma",
//   email: "deepak29@gmail.com",
//   phone: "9876543238",
//   department: "Finance",
//   designation: "Financial Analyst",
//   experience: 4,
//   joiningDate: "2021-11-30",
//   status: "Active",
//   image:"",
// },
// {
//   empId: "EMP030",
//   name: "Swati Jain",
//   email: "swati30@gmail.com",
//   phone: "9876543239",
//   department: "Sales",
//   designation: "Sales Manager",
//   experience: 6,
//   joiningDate: "2019-05-14",
//   status: "Active",
//   image:"",
// },

// {
//   empId: "EMP031",
//   name: "Vivek Gupta",
//   email: "vivek31@gmail.com",
//   phone: "9876543240",
//   department: "IT",
//   designation: "DevOps Engineer",
//   experience: 5,
//   joiningDate: "2020-12-01",
//   status: "Active",
//   image:"",
// },
// {
//   empId: "EMP032",
//   name: "Neha Reddy",
//   email: "neha32@gmail.com",
//   phone: "9876543241",
//   department: "Marketing",
//   designation: "Content Writer",
//   experience: 2,
//   joiningDate: "2023-08-10",
//   status: "Active",
//   image:"",
// },
// {
//   empId: "EMP033",
//   name: "Rohan Mehta",
//   email: "rohan33@gmail.com",
//   phone: "9876543242",
//   department: "IT",
//   designation: "Backend Developer",
//   experience: 3,
//   joiningDate: "2022-01-22",
//   status: "Active",
//   image:"",
// },
// {
//   empId: "EMP034",
//   name: "Ananya Das",
//   email: "ananya34@gmail.com",
//   phone: "9876543243",
//   department: "HR",
//   designation: "HR Manager",
//   experience: 6,
//   joiningDate: "2019-10-19",
//   status: "Active",
//   image:"",
// },
// {
//   empId: "EMP035",
//   name: "Mohit Bansal",
//   email: "mohit35@gmail.com",
//   phone: "9876543244",
//   department: "Sales",
//   designation: "Sales Executive",
//   experience: 1,
//   joiningDate: "2024-04-02",
//   status: "Active",
//   image:"",
// },

// {
//   empId: "EMP036",
//   name: "Shreya Patil",
//   email: "shreya36@gmail.com",
//   phone: "9876543245",
//   department: "Finance",
//   designation: "Account Manager",
//   experience: 5,
//   joiningDate: "2020-07-11",
//   status: "Active",
//   image:"",
// },
// {
//   empId: "EMP037",
//   name: "Arjun Nair",
//   email: "arjun37@gmail.com",
//   phone: "9876543246",
//   department: "IT",
//   designation: "Frontend Developer",
//   experience: 2,
//   joiningDate: "2023-09-15",
//   status: "Active",
//   image:"",
// },
// {
//   empId: "EMP038",
//   name: "Komal Shah",
//   email: "komal38@gmail.com",
//   phone: "9876543247",
//   department: "Marketing",
//   designation: "Digital Marketer",
//   experience: 4,
//   joiningDate: "2021-03-28",
//   status: "Active",
//   image:"",
// },
// {
//   empId: "EMP039",
//   name: "Aakash Singh",
//   email: "aakash39@gmail.com",
//   phone: "9876543248",
//   department: "IT",
//   designation: "Full Stack Developer",
//   experience: 6,
//   joiningDate: "2019-06-17",
//   status: "Active",
//   image:"",
// },
// {
//   empId: "EMP040",
//   name: "Bhavna Joshi",
//   email: "bhavna40@gmail.com",
//   phone: "9876543249",
//   department: "HR",
//   designation: "HR Executive",
//   experience: 3,
//   joiningDate: "2022-12-05",
//   status: "Active",
//   image:"",
// },

// {
//   empId: "EMP041",
//   name: "Siddharth Rao",
//   email: "siddharth41@gmail.com",
//   phone: "9876543250",
//   department: "Finance",
//   designation: "Financial Analyst",
//   experience: 4,
//   joiningDate: "2021-01-20",
//   status: "Active",
//   image:"",
// },
// {
//   empId: "EMP042",
//   name: "Meenal Kapoor",
//   email: "meenal42@gmail.com",
//   phone: "9876543251",
//   department: "Sales",
//   designation: "Sales Manager",
//   experience: 5,
//   joiningDate: "2020-08-14",
//   status: "Active",
//   image:"",
// },
// {
//   empId: "EMP043",
//   name: "Tarun Bhatia",
//   email: "tarun43@gmail.com",
//   phone: "9876543252",
//   department: "IT",
//   designation: "Backend Developer",
//   experience: 3,
//   joiningDate: "2022-04-09",
//   status: "Active",
//   image:"",
// },
// {
//   empId: "EMP044",
//   name: "Snehal Patil",
//   email: "snehal44@gmail.com",
//   phone: "9876543253",
//   department: "HR",
//   designation: "Recruiter",
//   experience: 2,
//   joiningDate: "2023-05-16",
//   status: "Active",
//   image:"",
// },
// {
//   empId: "EMP045",
//   name: "Gaurav Mishra",
//   email: "gaurav45@gmail.com",
//   phone: "9876543254",
//   department: "Marketing",
//   designation: "SEO Specialist",
//   experience: 3,
//   joiningDate: "2022-10-11",
//   status: "Active",
//   image:"",
// },

// {
//   empId: "EMP046",
//   name: "Pooja Desai",
//   email: "pooja46@gmail.com",
//   phone: "9876543255",
//   department: "IT",
//   designation: "DevOps Engineer",
//   experience: 5,
//   joiningDate: "2020-03-29",
//   status: "Active",
//   image:"",
// },
// {
//   empId: "EMP047",
//   name: "Rahul Nair",
//   email: "rahul47@gmail.com",
//   phone: "9876543256",
//   department: "Finance",
//   designation: "Accountant",
//   experience: 3,
//   joiningDate: "2021-09-18",
//   status: "Active",
//   image:"",
// },
// {
//   empId: "EMP048",
//   name: "Ishita Verma",
//   email: "ishita48@gmail.com",
//   phone: "9876543257",
//   department: "HR",
//   designation: "HR Manager",
//   experience: 6,
//   joiningDate: "2019-11-22",
//   status: "Active",
//   image:"",
// },
// {
//   empId: "EMP049",
//   name: "Aditya Raj",
//   email: "aditya49@gmail.com",
//   phone: "9876543258",
//   department: "Sales",
//   designation: "Sales Executive",
//   experience: 1,
//   joiningDate: "2024-02-28",
//   status: "Active",
//   image:"",
// },
// {
//   empId: "EMP050",
//   name: "Sneha Iyer",
//   email: "sneha50@gmail.com",
//   phone: "9876543259",
//   department: "IT",
//   designation: "Frontend Developer",
//   experience: 2,
//   joiningDate: "2023-06-30",
//   status: "Active",
//   image:"",
// },
// ]);
//   console.log(employees)
//   const [view, setView] = useState("table");

//   const [search, setSearch] = useState("");
//    const [sortBy, setSortBy] = useState("");

// // edit employee state
//    const [editEmployee, setEditEmployee] = useState(null);

// // delete
// const handleDelete = (empId) => {
//   const updatedEmployees = employees.filter(
//     (emp) => emp.empId !== empId
//   );

//   setEmployees(updatedEmployees);
// };


// // image
// const handleImageUpload = (empId, file) => {
//   const reader = new FileReader();

//   reader.onload = () => {
//     const updated = employees.map((emp) =>
//       emp.empId === empId
//         ? { ...emp, image: reader.result }
//         : emp
//     );

//     setEmployees(updated);
//   };

//   if (file) {
//     reader.readAsDataURL(file);
//   }
// };

//    // SEARCH FILTER (beginner level)
//   let filteredEmployees = employees.filter((employee) => {
//     return (
//       employee.name.toLowerCase().includes(search.toLowerCase()) ||
//       employee.department.toLowerCase().includes(search.toLowerCase())
//     );
//   });
 


 

// // SORT LOGIC

// // NAME A-Z
// if (sortBy === "name") {
//   filteredEmployees.sort((a, b) => {
//     if (a.name > b.name) return 1;
//     if (a.name < b.name) return -1;
//     return 0;
//   });
// }

// // EXPERIENCE LOW TO HIGH
// if (sortBy === "expLow") {
//   filteredEmployees.sort((a, b) => {
//     return a.experience - b.experience;
//   });
// }

// // EXPERIENCE HIGH TO LOW
// if (sortBy === "expHigh") {
//   filteredEmployees.sort((a, b) => {
//     return b.experience - a.experience;
//   });
// }

// // DATE OLD TO NEW
// if (sortBy === "dateOld") {
//   filteredEmployees.sort((a, b) => {
//     return new Date(a.joiningDate) - new Date(b.joiningDate);
//   });
// }

// // DATE NEW TO OLD
// if (sortBy === "dateNew") {
//   filteredEmployees.sort((a, b) => {
//     return new Date(b.joiningDate) - new Date(a.joiningDate);
//   });
// }



//   return (
//     <div className="min-h-screen bg-slate-100 py-8 px-4">
//       <div className="max-w-7xl mx-auto">

//         {/* Heading */}
//         <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
//           <h1 className="text-4xl font-bold text-center text-blue-700">
//             Employee Management System
//           </h1>
//         </div>

//         {/* Dashboard */}
//         <Dashboard   employees={filteredEmployees} />

//         {/* Employee Form */}
//         <div className="mt-6">
//           <EmployeeForm    employees={filteredEmployees} setEmployees={setEmployees} editEmployee={editEmployee} setEditEmployee={setEditEmployee}/>
//         </div>

//         {/* Search + Sort + Toggle */}
//         <div className="bg-white rounded-2xl shadow-md p-4 mt-6">

//           <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

//             {/* Search */}
//             <div className="flex-1">
//               <SearchBar  search={search} setSearch={setSearch}/>
//             </div>

//             {/* Right Section */}
//             <div className="flex flex-col sm:flex-row items-center gap-3">

//               <SortDropdown  sortBy={sortBy} setSortBy={setSortBy}/>

//               {/* View Toggle */}
//               <div className="flex gap-2">

//                 <button
//                   onClick={() => setView("table")}
//                   className={`px-5 py-2 rounded-lg font-medium transition-all duration-200 ${
//                     view === "table"
//                       ? "bg-blue-600 text-white shadow-md"
//                       : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//                   }`}
//                 >
//                   Table View
//                 </button>

//                 <button
//                   onClick={() => setView("card")}
//                   className={`px-5 py-2 rounded-lg font-medium transition-all duration-200 ${
//                     view === "card"
//                       ? "bg-blue-600 text-white shadow-md"
//                       : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//                   }`}
//                 >
//                   Card View
//                 </button>

//               </div>
//             </div>
//           </div>

//         </div>

//         {/* Content Area */}
//         <div className="mt-6">

//           {view === "table" && (
//             <div className="bg-white rounded-2xl shadow-md p-4">
//             <EmployeeTable
//   employees={filteredEmployees}
//   setEditEmployee={setEditEmployee}
//    handleDelete={handleDelete}
//    handleImageUpload={handleImageUpload}
// />
//             </div>
//           )}

//           {view === "card" && (
//             <div className="bg-white rounded-2xl shadow-md p-4">
//            <EmployeeCard
//   employees={filteredEmployees}
//   setEditEmployee={setEditEmployee}
//     handleDelete={handleDelete}
//     handleImageUpload={handleImageUpload}
// />
//             </div>
//           )}

//         </div>

//       </div>
//     </div>
//   );}


// ========================================  5-day  ===========================================

// import React, { useState } from "react";
// import EmployeeForm from "./Task-day-5/components/EmployeeForm";
// ;import EmployeeTable from "./Task-day-5/components/EmployeeTable";
// import useEmployees from "./Task-day-5/hooks/useEmployees";

// export default function App() {
//   const {
//     employees,
//     loading,
//     error,
//     fetchEmployees,
//     handleAdd,
//     handleUpdate,
//     handleDelete,
//     handleSearch,
//   } = useEmployees();

//   const [editEmployee, setEditEmployee] = useState(null);
//   const [search, setSearch] = useState("");

//   const handleSearchChange = (e) => {
//     const value = e.target.value;
//     setSearch(value);
//     handleSearch(value);
//   };

//   return (
//     <div className="min-h-screen bg-slate-100 py-8 px-4">
//       <div className="max-w-7xl mx-auto">

//         {/* Heading */}
//         <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
//           <h1 className="text-4xl font-bold text-center text-blue-700">
//             Employee Management System
//           </h1>
//         </div>

//         {/* Employee Form */}
//         <div className="mt-6">
//           <EmployeeForm
//             editEmployee={editEmployee}
//             setEditEmployee={setEditEmployee}
//             handleAdd={handleAdd}
//             handleUpdate={handleUpdate}
//           />
//         </div>

//         {/* Search + Refresh */}
//         <div className="bg-white rounded-2xl shadow-md p-4 mt-6">
//           <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

//             {/* Search Bar */}
//             <div className="flex-1">
//               <input
//                 type="text"
//                 placeholder="Search by name or department..."
//                 value={search}
//                 onChange={handleSearchChange}
//                 className="w-full border border-gray-300 p-3 rounded-lg shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//             </div>

//             {/* Refresh Button */}
//             <button
//               onClick={fetchEmployees}
//               className="px-5 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all duration-200 shadow-md"
//             >
//               🔄 Refresh Employees
//             </button>

//           </div>
//         </div>

//         {/* Error Message */}
//         {error && (
//           <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl">
//             <p className="font-semibold">⚠ {error}</p>
//             <p className="text-sm mt-1">Please try again later.</p>
//           </div>
//         )}

//         {/* Loading / Table */}
//         <div className="mt-6">
//           {loading ? (
//             <div className="bg-white rounded-2xl shadow-md p-10 text-center">
//               <p className="text-xl text-blue-600 font-semibold animate-pulse">
//                 Loading employees...
//               </p>
//             </div>
//           ) : (
//             <div className="bg-white rounded-2xl shadow-md p-4">
//               <EmployeeTable
//                 employees={employees}
//                 setEditEmployee={setEditEmployee}
//                 handleDelete={handleDelete}
//               />
//             </div>
//           )}
//         </div>

//       </div>
//     </div>
//   );
// }
//  



// =============================day 6 task rothEmployees management =============================

// 




// AI Enterprise Multi-Agent AI Workspace======================================


import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./Task-7-I Enterprise-AI-work-space/Pages/Login.jsx";
import Register from "./Task-7-I Enterprise-AI-work-space/Pages/Register.jsx";
import Dashboard from "./Task-7-I Enterprise-AI-work-space/Pages/Dashboard.jsx";
import Chat from "./Task-7-I Enterprise-AI-work-space/Pages/Chat.jsx";
import Documents from "./Task-7-I Enterprise-AI-work-space/Pages/Documents.jsx";
import Agents from "./Task-7-I Enterprise-AI-work-space/Pages/Agents.jsx";
import Users from "./Task-7-I Enterprise-AI-work-space/Pages/Users.jsx";
import Analytics from "./Task-7-I Enterprise-AI-work-space/Pages/Analytics.jsx";
import Settings from "./Task-7-I Enterprise-AI-work-space/Pages/Settings.jsx";

import ProtectedRoute from "./Task-7-I Enterprise-AI-work-space/Components/ProtectedRoute.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ================= ROOT ================= */}

        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />


        {/* ================= PUBLIC ROUTES ================= */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />


        {/* ================= DASHBOARD ================= */}
        {/* Admin + Manager + Employee */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute
              allowedRoles={[
                "admin",
                "manager",
                "employee",
              ]}
            >
              <Dashboard />
            </ProtectedRoute>
          }
        />


        {/* ================= AI CHAT ================= */}
        {/* Admin + Manager + Employee */}

        <Route
          path="/chat"
          element={
            <ProtectedRoute
              allowedRoles={[
                "admin",
                "manager",
                "employee",
              ]}
            >
              <Chat />
            </ProtectedRoute>
          }
        />


        {/* ================= DOCUMENTS ================= */}
        {/* Admin + Manager + Employee */}

        <Route
          path="/documents"
          element={
            <ProtectedRoute
              allowedRoles={[
                "admin",
                "manager",
                "employee",
              ]}
            >
              <Documents />
            </ProtectedRoute>
          }
        />


        {/* ================= AI AGENTS ================= */}
        {/* Admin + Manager + Employee */}

        <Route
          path="/agents"
          element={
            <ProtectedRoute
              allowedRoles={[
                "admin",
                "manager",
                "employee",
              ]}
            >
              <Agents />
            </ProtectedRoute>
          }
        />


        {/* ================= USERS ================= */}
        {/* ADMIN ONLY */}

        <Route
          path="/users"
          element={
            <ProtectedRoute
              allowedRoles={["admin"]}
            >
              <Users />
            </ProtectedRoute>
          }
        />


        {/* ================= ANALYTICS ================= */}
        {/* ADMIN + MANAGER */}

        <Route
          path="/analytics"
          element={
            <ProtectedRoute
              allowedRoles={[
                "admin",
                "manager",
              ]}
            >
              <Analytics />
            </ProtectedRoute>
          }
        />


        {/* ================= SETTINGS ================= */}
        {/* Admin + Manager + Employee */}

        <Route
          path="/settings"
          element={
            <ProtectedRoute
              allowedRoles={[
                "admin",
                "manager",
                "employee",
              ]}
            >
              <Settings />
            </ProtectedRoute>
          }
        />


        {/* ================= UNKNOWN URL ================= */}

        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;