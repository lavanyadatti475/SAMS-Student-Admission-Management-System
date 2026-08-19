import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);
  const navigate = useNavigate();
  const { login } = useAuth();

 const handleSubmit = async (event) => {

  event.preventDefault();

  setError(null);

  try {

   const user = await login(form);

console.log(user);

if (user.role === "admin") {
    navigate("/admin/dashboard");
} else {
    navigate("/student/dashboard");
}

  } catch(err){

    setError(
      err.response?.data?.error ||
      "Login failed"
    );

  }

};  

const fadeUp = {
  hidden: {
    opacity: 0,
    y: 50
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7
    }
  }
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const cardVariant = {
  hidden: {
    opacity: 0,
    y: 50,
    scale: 0.9,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
}; 

return (
  <div
  className="min-h-screen bg-cover bg-center"
  style={{
     background:
      "linear-gradient(135deg, #f0f9ff 0%, #dbeafe 40%, #bfdbfe 100%)"
  }}
>
    {/* Header */}
    <motion.div
  initial={{
    opacity: 0,
    y: -50
  }}
  animate={{
    opacity: 1,
    y: 0
  }}
  transition={{
    duration: 0.8
  }}
  className="bg-sky-900 text-white py-6 shadow-xl"
>
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h1 className="text-5xl font-bold tracking-wide">
          🎓 SAMS
        </h1>

        <h2 className="text-2xl mt-2 font-semibold">
          Student Admission Management System
        </h2>

        <p className="mt-2 text-indigo-200">
          Academic Year 2026 - 2027 Admissions Portal
        </p>
      </div>
    </motion.div>

    {/* Notice */}
    <div className="max-w-6xl mx-auto mt-8 px-6">
      <div className="bg-amber-50 border-l-4 border-amber-500 p-5 rounded-xl shadow-md">
        <h3 className="font-bold text-amber-700 text-lg">
          📢 Admission Notice
        </h3>

        <p className="text-yellow-700 mt-2">
          Applications for Academic Year 2026-27 are now open.
          Submit your application before
          <b> 31 July 2026 </b>
          to secure admission.
        </p>
      </div>
    </div>

    {/* Statistics */}
<div className="max-w-6xl mx-auto px-6 mt-10">
  <motion.div
    className="grid md:grid-cols-4 gap-5"
    variants={staggerContainer}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true }}
  >
    {/* Students */}
    <motion.div
      variants={cardVariant}
      whileHover={{ y: -10, scale: 1.05 }}
      className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl text-center"
    >
      <h2 className="text-4xl font-bold text-sky-600">
        5000+
      </h2>
      <p className="text-slate-600 mt-2">
        Students
      </p>
    </motion.div>

    {/* Courses */}
    <motion.div
      variants={cardVariant}
      whileHover={{ y: -10, scale: 1.05 }}
      className="bg-white rounded-2xl p-6 shadow-lg text-center"
    >
      <h2 className="text-4xl font-bold text-green-600">
        10
      </h2>
      <p className="text-slate-600 mt-2">
        Courses
      </p>
    </motion.div>

    {/* Placement */}
    <motion.div
      variants={cardVariant}
      whileHover={{ y: -10, scale: 1.05 }}
      className="bg-white rounded-2xl p-6 shadow-lg text-center"
    >
      <h2 className="text-4xl font-bold text-purple-600">
        88%
      </h2>
      <p className="text-slate-600 mt-2">
        Placement Rate
      </p>
    </motion.div>

    {/* Support */}
    <motion.div
      variants={cardVariant}
      whileHover={{ y: -10, scale: 1.05 }}
      className="bg-white rounded-2xl p-6 shadow-lg text-center"
    >
      <h2 className="text-4xl font-bold text-orange-500">
        24/7
      </h2>
      <p className="text-slate-600 mt-2">
        Support
      </p>
    </motion.div>
  </motion.div>
</div>
    {/* Login Card */}
    <div className="max-w-lg mx-auto mt-12 px-6">

      <motion.div
  initial={{
    opacity: 0,
    scale: 0.9
  }}
  animate={{
    opacity: 1,
    scale: 1
  }}
  transition={{
    duration: 0.8
  }}
  className="
    bg-white/95
    backdrop-blur-md
    rounded-3xl
    shadow-2xl
    p-10
    border
    border-slate-200
  "
>

        <h2 className="text-3xl font-bold text-center text-sky-700">
          Login Portal
        </h2>

        <p className="text-center text-slate-500 mt-2 mb-8">
          Student & Admin Access
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">

          <div>
            <label className="font-medium text-slate-700">
              Email Address
            </label>

            <input
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm({
                  ...form,
                  email: e.target.value
                })
              }
              placeholder="Enter Email"
              className="w-full mt-2 p-4 border rounded-xl focus:ring-2 focus:ring-sky-400 outline-none"
            />
          </div>

          <div>
            <label className="font-medium text-slate-700">
              Password
            </label>

            <input
              type="password"
              value={form.password}
              onChange={(e) =>
                setForm({
                  ...form,
                  password: e.target.value
                })
              }
              placeholder="Enter Password"
              className="w-full mt-2 p-4 border rounded-xl focus:ring-2 focus:ring-sky-400 outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-sky-600 text-white py-4 rounded-xl font-semibold hover:bg-sky-700 transition"
          >
            Sign In
          </button>

          {error && (
            <div className="bg-red-100 border border-red-300 text-red-700 p-3 rounded-xl">
              {error}
            </div>
          )}
        </form>

        <p className="mt-6 text-center">
          New User?{" "}
          <Link
            to="/register"
            className="text-sky-600 font-semibold"
          >
            Create Account
          </Link>
        </p>

      </motion.div>
    </div>

    {/* Features */}
    <div className="max-w-6xl mx-auto px-6 mt-16">
      <h2 className="text-3xl font-bold text-center text-slate-800 mb-10">
        Why Choose SAMS?
      </h2>

      <div className="grid md:grid-cols-3 gap-6">

        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <h3 className="text-xl font-bold text-sky-700">
            📋 Online Applications
          </h3>

          <p className="mt-3 text-slate-600">
            Submit admission applications online from anywhere.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <h3 className="text-xl font-bold text-green-700">
            📄 Document Verification
          </h3>

          <p className="mt-3 text-slate-600">
            Upload and verify documents securely.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <h3 className="text-xl font-bold text-purple-700">
            📊 Real-Time Tracking
          </h3>

          <p className="mt-3 text-slate-600">
            Monitor admission status and application progress.
          </p>
        </div>

      </div>
    </div>

    {/* Contact */}
    <div className="max-w-6xl mx-auto px-6 mt-16">
      <div className="bg-white rounded-3xl shadow-xl p-8">

        <h2 className="text-2xl font-bold text-sky-700 mb-4">
          📞 Help Desk
        </h2>

        <div className="grid md:grid-cols-3 gap-4 text-slate-700">

          <div>
            <h3 className="font-semibold">
              Email
            </h3>
            <p>support@sams.edu</p>
          </div>

          <div>
            <h3 className="font-semibold">
              Phone
            </h3>
            <p>+91 6301594486</p>
          </div>

          <div>
            <h3 className="font-semibold">
              Working Hours
            </h3>
            <p>9:00 AM - 6:00 PM</p>
          </div>
        </div>

      </div>
    </div>

    {/* Footer */}
    <footer className="mt-16 bg-sky-800 text-white py-6 text-center">
      <p>
        © 2026 Student Admission Management System
      </p>

      <p className="text-sky-200 mt-2">
        Developed using React, Node.js, Express, PostgreSQL & Prisma
      </p>
    </footer>

  </div>
);
}
