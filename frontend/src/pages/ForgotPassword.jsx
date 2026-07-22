import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail } from "lucide-react";
import axios from "axios";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const res = await axios.post(
        "http://127.0.0.1:5000/api/forgot-password",
        { email }
      );

      setMessage(res.data.message);

      setTimeout(() => {
        navigate("/verify-otp", {
          state: { email },
        });
      }, 1500);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Something went wrong. Please try again."
      );
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">

      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8">
                    <div className="flex justify-center mb-4">
                <div className="bg-green-500/10 p-4 rounded-full">
                    <Mail className="w-10 h-10 text-green-500" />
                </div>
            </div>

        <h1 className="text-3xl font-bold text-center text-green-600 mb-2">
          Forgot Password
        </h1>

        <p className="text-center text-gray-500 dark:text-gray-400 mb-8">
          Enter your registered email address.
        </p>

        {message && (
          <div className="mb-4 rounded-lg bg-green-100 text-green-700 p-3">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-lg bg-red-100 text-red-700 p-3">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          <div className="mb-6">
            <label className="block mb-2 font-medium">
              Email Address
            </label>

            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full rounded-lg border px-4 py-3 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white rounded-lg py-3 font-semibold transition"
          >
            {loading ? "Sending OTP..." : "Send OTP"}
          </button>

        </form>

        <div className="mt-6 text-center">

          <Link
            to="/login"
            className="text-green-600 hover:underline"
          >
            ← Back to Login
          </Link>

        </div>

      </div>

    </div>
  );
};

export default ForgotPassword;