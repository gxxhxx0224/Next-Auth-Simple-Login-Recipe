'use client'
import React from 'react'
import Link from "next/link"
import {useSession, signOut} from 'next-auth/react'
import {usePathname, useRouter} from 'next/navigation'

const Navbar = () => {
    const {data: session} = useSession(); // 세션 정보를 가져옴
    const pathname = usePathname(); // 현재 경로 가져오기
    const router = useRouter();

    const logout = () => {
        signOut();
        router.push('/')
    }

    // 만약 현재 경로가 "/signin"이라면 Navbar를 렌더링하지 않음
    if (pathname === '/signin') {
        return null;
    }

    return (
        <div className="pb-16">
            <nav
                className="fixed top-0 left-0 w-full bg-emerald-700 shadow-lg flex justify-between items-center z-50 px-6 py-3">
                <Link href="/" className="text-white font-bold text-3xl font-sans tracking-wide">
                    흑백 레시피
                </Link>

                <div className="flex items-center space-x-6">
                    {session ? ( // 세션 정보가 있으면 signOut() 호출
                        <div className="flex items-center space-x-4">
                        <span className="text-white text-lg font-medium">
                            {session.user!.email!.split('@')[0]}
                        </span>
                            <button
                                onClick={() => logout()}
                                className="bg-red-500 hover:bg-red-800 text-white px-4 py-2 rounded-lg font-semibold shadow transition duration-300"
                            >
                                로그아웃
                            </button>
                        </div>
                    ) : ( // 세션 정보가 없으면 signIn() 호출
                        <Link
                            href="/signin"
                            className="bg-emerald-500 hover:bg-red-700 text-white px-3 py-2 duration-500 font-bold rounded"
                        >
                            로그인
                        </Link>
                    )}
                </div>
            </nav>
        </div>
    )
}

export default Navbar;
