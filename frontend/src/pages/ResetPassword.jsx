import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { Lock, Eye, EyeOff, CheckCircle } from "lucide-react";

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const getStrength = () => {
    let score = 0;

    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) return { text: "Weak", color: "bg-red-500", width: "33%" };
    if (score <= 4) return { text: "Medium", color: "bg-yellow-500", width: "66%" };

    return { text: "Strong", color: "bg-green-500", width: "100%" };
  };

  const strength = getStrength();

  const handleSubmit = async () => {
    setError("");
    setMessage("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(
        "http://127.0.0.1:5000/api/reset-password",
        {
          email,
          password,
        }
      );

      setMessage(res.data.message);

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Unable to reset password."
      );
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">

      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8">

        <div className="flex justify-center mb-5">
          <div className="bg-green-100 dark:bg-green-900 p-4 rounded-full">
            <Lock className="w-10 h-10 text-green-600" />
          </div>
        </div>

        <h2 className="text-3xl font-bold text-center text-green-600">
          Reset Password
        </h2>

        <p className="text-center mt-2 text-gray-500 dark:text-gray-400">
          Create a new secure password.
        </p>

        {message && (
          <div className="mt-5 p-3 rounded-lg bg-green-100 text-green-700 flex items-center gap-2">
            <CheckCircle size={18} />
            {message}
          </div>
        )}

        {error && (
          <div className="mt-5 p-3 rounded-lg bg-red-100 text-red-700">
            {error}
          </div>
        )}

        {/* Password */}

        <div className="mt-6 relative">

          <label className="font-medium">
            New Password
          </label>

          <input
            type={showPassword ? "text" : "password"}
            className="w-full mt-2 border rounded-lg px-4 py-3 dark:bg-gray-700"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="button"
            className="absolute right-4 top-12"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={20}/> : <Eye size={20}/>}
          </button>

        </div>

        {/* Strength */}

        <div className="mt-4">

          <div className="h-2 bg-gray-300 rounded-full overflow-hidden">

            <div
              className={`${strength.color} h-full`}
              style={{ width: strength.width }}
            />

          </div>

          <p className="text-sm mt-2">
            Strength: <b>{strength.text}</b>
          </p>

        </div>

        {/* Confirm */}

        <div className="mt-6 relative">

          <label className="font-medium">
            Confirm Password
          </label>

          <input
            type={showConfirm ? "text" : "password"}
            className="w-full mt-2 border rounded-lg px-4 py-3 dark:bg-gray-700"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <button
            type="button"
            className="absolute right-4 top-12"
            onClick={() => setShowConfirm(!showConfirm)}
          >
            {showConfirm ? <EyeOff size={20}/> : <Eye size={20}/>}
          </button>

        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="mt-8 w-full bg-green-600 hover:bg-green-700 text-white rounded-lg py-3 font-semibold"
        >
          {loading ? "Updating..." : "Update Password"}
        </button>

        <div className="text-center mt-6">

          <Link
            to="/login"
            className="text-green-600 hover:underline"
          >
            Back to Login
          </Link>

        </div>

      </div>

    </div>
  );
};

export default ResetPassword;