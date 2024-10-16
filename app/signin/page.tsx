'use client';
import Image from "next/image";
import { signIn } from "next-auth/react";
import React, { useState } from 'react';
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";

export default function SignInPage() {
    const [credentials, setCredentials] = useState({
        email: "",
        password: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCredentials({
            ...credentials,
            [e.target.name]: e.target.value,  // input name에 따라 상태 업데이트
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const result = await signIn("credentials", {
            redirect: true,
            email: credentials.email,
            password: credentials.password,
            callbackUrl: "/",
        });

        if (result?.error) {
            console.log("Error:", result.error);
        } else {
            console.log("Logged in successfully");
        }
    };

    return (
        <section className="min-h-screen flex items-center justify-center bg-gradient-to-r from-emerald-800 to-emerald-300">
            <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
                <div className="flex justify-center mb-6">
                    <Image src="/image/login.png" alt="Login Image" width={120} height={50} />
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-left text-sm font-semibold text-gray-600">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            name="email"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            value={credentials.email}
                            onChange={handleChange}
                            placeholder="your-email@example.com"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-left text-sm font-semibold text-gray-600">
                            Password
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            value={credentials.password}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            placeholder="Password"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-emerald-700 text-white py-2 rounded-lg font-bold hover:bg-red-800 transition duration-500"
                    >
                        Login
                    </button>
                </form>

                <div className="mt-8 space-y-4">
                    <button
                        className="flex items-center justify-center w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition duration-200"
                        onClick={() => signIn('google', { callbackUrl: "/" })}
                    >
                        <FcGoogle className="mr-3" size={24} />
                        <span className="text-lg">Sign in with Google</span>
                    </button>
                    <button
                        className="flex items-center justify-center w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition duration-200"
                        onClick={() => signIn('github', { callbackUrl: "/" })}
                    >
                        <FaGithub className="mr-3" size={24} />
                        <span className="text-lg">Sign in with Github</span>
                    </button>
                </div>
            </div>
        </section>
    );
}
