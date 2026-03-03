import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from '../api/apiclient' 

const PaymentGateway = ({ amount, description }) => {
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const navigate = useNavigate();
  const { user, refreshAccessToken } = useAuth();

  const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;

  useEffect(() => {
    if (window.Razorpay) {
      setRazorpayLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => setRazorpayLoaded(true);
    document.body.appendChild(script);
  }, []);

  const handlePayment = async () => {
    if (!razorpayLoaded || isProcessing) return;

    try {
      setIsProcessing(true);

      const { data: orderData } = await api.post("/me/init", {
        amount,
      });

      const options = {
        key: razorpayKey,
        amount: orderData.amount,
        currency: "INR",
        name: "DeployHub",
        description,
        order_id: orderData.id,

        handler: async function (response) {
          try {
            const { data } = await api.post("/me/verify", {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            });

            console.log(data)
            if (data.success) {
              await refreshAccessToken();   // 🔥 important
              navigate("/");
            } else {
              alert("Payment verification failed");
            }
          } catch {
            alert("Verification error");
          } finally {
            setIsProcessing(false);
          }
        },

        prefill: {
          name: user?.fullname || "",
          email: user?.email || "",
        },

        modal: {
          ondismiss: () => setIsProcessing(false),
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();

    } catch {
      alert("Payment init failed");
      setIsProcessing(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={!razorpayLoaded || isProcessing}
      className="w-full bg-green-600 text-white py-3 rounded-lg"
    >
      {isProcessing ? "Processing..." : `Pay ₹${amount / 100}`}
    </button>
  );
};

export default PaymentGateway;