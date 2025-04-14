import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext'; // Import the useAuth hook

export const VerifyOtp: React.FC = () => {
    const { user } = useAuth(); // Access the user object from AuthContext
    const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
    const [message, setMessage] = useState<string>('');
    const [isResendDisabled, setIsResendDisabled] = useState<boolean>(false); // Disable resend button
    const [countdown, setCountdown] = useState<number>(0); // Countdown timer for resend

    const handleChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        if (isNaN(Number(value))) return;

        let newOtp = [...otp];
        newOtp[index] = value.substring(value.length - 1);
        setOtp(newOtp);

        if (value && index < 5) {
            const nextInput = document.getElementById(`otp-input-${index + 1}`) as HTMLInputElement;
            if (nextInput) nextInput.focus();
        }
    };

    const handleSubmit = async () => {
        const enteredOtp = otp.join('');
        if (enteredOtp.length < 6) {
            setMessage('Please enter a valid 6-digit OTP.');
            return;
        }

        try {
            const response = await fetch('https://leafcareai.vercel.app/backend/verify_otp/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username: user?.name, otp: enteredOtp }), // Use username from AuthContext
            });

            const data = await response.json();
            if (data.success) {
                setMessage('OTP Verified Successfully!');
                setTimeout(() => {
                    window.location.href = '/';
                }, 1000);
            } else {
                setMessage(data.message);
            }
        } catch (error) {
            setMessage('Error verifying OTP. Please try again.');
        }
    };

    const handleResendOtp = async () => {
        setMessage('Sending OTP');
         // Clear previous messages
        try {
            const response = await fetch('https://leafcareai.vercel.app/backend/resend_otp/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username: user?.name }), // Send username to backend
            });

            const data = await response.json();
            if (data.success) {
                setMessage('A new OTP has been sent successfully.');
                setIsResendDisabled(true); // Disable the button
                setCountdown(60); // Start the countdown timer (1 minute)
            } else {
                setMessage(data.message);
            }
        } catch (error) {
            setMessage('Error resending OTP. Please try again.');
        }
    };

    // Countdown timer logic
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isResendDisabled && countdown > 0) {
            timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000); // Decrease countdown every second
        } else if (countdown === 0) {
            setIsResendDisabled(false); // Enable the button when countdown ends
        }
        return () => clearTimeout(timer); // Cleanup timer
    }, [countdown, isResendDisabled]);

    return (
        <div className="form-container">
            <h2>Verification</h2>
            <p>OTP has been sent to your registered email <strong>{user?.email}</strong>. Please check and enter it below.</p>
            <div className="otp-inputs">
                {otp.map((_, index) => (
                    <input
                        key={index}
                        id={`otp-input-${index}`}
                        type="text"
                        maxLength={1}
                        value={otp[index]}
                        onChange={(e) => handleChange(index, e)}
                        className="otp-box"
                    />
                ))}
            </div>
            <div className="buttons-flex">
                <button
                    className="button"
                    onClick={handleResendOtp}
                    disabled={isResendDisabled} // Disable button when countdown is active
                >
                    {isResendDisabled ? `Resend in ${countdown}s` : 'Resend'}
                </button>
                <button onClick={handleSubmit} className="button">Verify</button>
            </div>
            <div className="form-footer">{message && <p>{message}</p>}</div>
        </div>
    );
};

export default VerifyOtp; 