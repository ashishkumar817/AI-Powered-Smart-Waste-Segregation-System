import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { ShieldCheck } from "lucide-react";

const VerifyOTP = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || "";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputs = useRef([]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [timer, setTimer] = useState(300);

  useEffect(() => {
    if (!email) {
      navigate("/forgot-password");
    }
  }, [email, navigate]);

  useEffect(() => {
    if (timer <= 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (value, index) => {
    if (!/^\d*$/.test(value)) return;

    const updated = [...otp];
    updated[index] = value.slice(-1);

    setOtp(updated);

    if (value && index < 5) {
      inputs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (
      e.key === "Backspace" &&
      otp[index] === "" &&
      index > 0
    ) {
      inputs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    const paste = e.clipboardData.getData("text").trim();

    if (!/^\d{6}$/.test(paste)) return;

    const digits = paste.split("");

    setOtp(digits);

    digits.forEach((digit, i) => {
      inputs.current[i].value = digit;
    });

    inputs.current[5].focus();
  };

  const verifyOTP = async () => {
    const code = otp.join("");

    if (code.length !== 6) {
      setError("Please enter all 6 digits.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await axios.post(
        "http://127.0.0.1:5000/api/verify-otp",
        {
          email,
          otp: code,
        }
      );

      setMessage(res.data.message);

      setTimeout(() => {
        navigate("/reset-password", {
          state: { email },
        });
      }, 1500);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Verification failed."
      );
    }

    setLoading(false);
  };

  const resendOTP = async () => {
    try {
      await axios.post(
        "http://127.0.0.1:5000/api/forgot-password",
        { email }
      );

      setTimer(300);

      setMessage("New OTP sent.");

      setError("");
    } catch {
      setError("Unable to resend OTP.");
    }
  };

  const minutes = String(Math.floor(timer / 60)).padStart(2, "0");
  const seconds = String(timer % 60).padStart(2, "0");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">

      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8">

        <div className="flex justify-center mb-4">
          <div className="bg-green-100 dark:bg-green-900 p-4 rounded-full">
            <ShieldCheck className="text-green-600 w-10 h-10" />
          </div>
        </div>

        <h2 className="text-3xl font-bold text-center text-green-600">
          Verify OTP
        </h2>

        <p className="text-center text-gray-500 dark:text-gray-400 mt-2">
          Enter the 6-digit code sent to
        </p>

        <p className="text-center font-semibold mt-1">
          {email}
        </p>

        {message && (
          <div className="mt-4 bg-green-100 text-green-700 p-3 rounded-lg">
            {message}
          </div>
        )}

        {error && (
          <div className="mt-4 bg-red-100 text-red-700 p-3 rounded-lg">
            {error}
          </div>
        )}

        <div
          className="flex justify-between mt-8"
          onPaste={handlePaste}
        >
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputs.current[index] = el)}
              maxLength={1}
              value={digit}
              onChange={(e) =>
                handleChange(e.target.value, index)
              }
              onKeyDown={(e) =>
                handleKeyDown(e, index)
              }
              className="w-12 h-14 text-center text-2xl border rounded-lg dark:bg-gray-700"
            />
          ))}
        </div>

        <p className="text-center mt-6 text-sm">
          OTP expires in
          <span className="font-bold text-green-600">
            {" "}
            {minutes}:{seconds}
          </span>
        </p>

        <button
          onClick={verifyOTP}
          disabled={loading}
          className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold"
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>

        <button
          onClick={resendOTP}
          disabled={timer > 0}
          className={`mt-4 w-full py-3 rounded-lg font-semibold ${
            timer > 0
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-gray-800 text-white hover:bg-gray-700"
          }`}
        >
          Resend OTP
        </button>

        <div className="text-center mt-6">
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

export default VerifyOTP;