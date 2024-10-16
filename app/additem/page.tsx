'use client'
import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Recipe {
    title: string;
    tag: string[];
    ingredients: string[];
    process: string[];
    version: number;
    timestamp: string;
}

export default function AddRecipe() {
    const { data: session } = useSession(); // 세션 정보를 가져옴
    const router = useRouter();

    const [recipe, setRecipe] = useState({
        title: "",
        tag: [""],
        ingredients: [""],
        process: [""],
        version: 1,
        timestamp: ""
    });

    // 제목, 태그, 재료, 과정 값 변경 처리
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        index?: number,
        field?: string
    ) => {
        const { name, value } = e.target;
        if (name === "title") {
            setRecipe({ ...recipe, [name]: value }); // 제목 업데이트
        } else if (field && index !== undefined) {
            const updatedArray = [...recipe[field as keyof typeof recipe] as string[]];
            updatedArray[index] = value; // 해당 배열 값 업데이트
            setRecipe({ ...recipe, [field]: updatedArray });
        }
    };

    // 태그, 재료, 과정 추가
    const addField = (field: "tag" | "ingredients" | "process") => {
        setRecipe({ ...recipe, [field]: [...recipe[field], ""] });
    };

    // 태그, 재료, 과정 삭제
    const removeField = (field: "tag" | "ingredients" | "process", index: number) => {
        if (recipe[field].length > 1) {
            const updatedArray = [...recipe[field]];
            updatedArray.splice(index, 1); // 해당 인덱스의 항목을 제거
            setRecipe({ ...recipe, [field]: updatedArray });
        }
    };

    // 필드가 빈 값인지 확인하는 함수
    const isFieldEmpty = (fields: string[]) => {
        return fields.some(field => field.trim() === "");
    };

    const saveToLocalStorage = () => {
        // 현재 시간을 저장
        const currentTimestamp = new Date().toLocaleString(); // 시간 형식: "YYYY-MM-DD HH:mm:ss"

        // 입력 값이 비어 있는지 확인
        if (!recipe.title.trim()) {
            alert("레시피 제목을 입력하셔유.");
            return;
        }

        if (isFieldEmpty(recipe.tag)) {
            alert("모든 태그를 입력하셔유.");
            return;
        }

        if (isFieldEmpty(recipe.ingredients)) {
            alert("모든 재료를 입력하셔유.");
            return;
        }

        if (isFieldEmpty(recipe.process)) {
            alert("모든 과정을 .");
            return;
        }

        if (session) {
            const savedRecipes = localStorage.getItem(JSON.stringify(session.user?.email));
            let updatedRecipes: Recipe[] = [];  // 배열로 초기화

            if (savedRecipes) {
                try {
                    const parsedRecipes = JSON.parse(savedRecipes);

                    // 불러온 데이터가 배열인지 확인, 아니면 빈 배열로 설정
                    if (Array.isArray(parsedRecipes)) {
                        updatedRecipes = parsedRecipes;
                    } else {
                        console.error("저장된 레시피가 배열이 아니구먼유. 빈 배열로 초기화할게유.");
                    }
                } catch (error) {
                    console.error("레시피를 불러오다가 오류났슈:", error);
                }
            }

            // 제목이 같은 레시피 중에서 가장 높은 버전을 찾음
            const existingRecipes = updatedRecipes.filter(r => r.title === recipe.title);
            if (existingRecipes.length > 0) {
                // 같은 제목의 레시피 중에서 가장 높은 버전을 찾음
                const highestVersionRecipe = existingRecipes.reduce((highest, current) =>
                    current.version > highest.version ? current : highest, existingRecipes[0]
                );

                // 가장 높은 버전에서 1 증가하고, 현재 시간을 timestamp로 추가
                const newVersion = highestVersionRecipe.version + 1;
                updatedRecipes.push({ ...recipe, version: newVersion, timestamp: currentTimestamp });
            } else {
                // 같은 제목의 레시피가 없으면 version 1로 추가하고, 현재 시간을 timestamp로 추가
                updatedRecipes.push({ ...recipe, version: 1, timestamp: currentTimestamp });
            }

            // 로컬 스토리지에 다시 저장
            localStorage.setItem(JSON.stringify(session.user?.email), JSON.stringify(updatedRecipes));
            alert("레시피가 이븐하게 저장됐어요.");
            router.push('/')
        } else {
            alert('로그인이 필요해유.');
            router.push('/signin')
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen flex justify-center items-center py-10 px-4">
            <div className="bg-white shadow-lg rounded-lg w-full max-w-2xl p-8">
                <div className="text-3xl font-bold text-center mb-6 text-gray-800">새 레시피 추가</div>

                {/* 레시피 제목 입력 */}
                <div className="mb-6">
                    <label htmlFor="title" className="block text-xl font-semibold mb-2 text-gray-700">
                        레시피 제목
                    </label>
                    <input
                        id="title"
                        type="text"
                        name="title"
                        className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={recipe.title}
                        onChange={handleChange}
                        placeholder="레시피 제목을 입력하셔유"
                        required
                    />
                </div>

                {/* 태그 입력 폼 */}
                <div className="mb-6">
                    <label className="block text-xl font-semibold mb-2 text-gray-700">태그</label>
                    {recipe.tag.map((tag, index) => (
                        <div key={index} className="flex items-center mb-3">
                            <input
                                type="text"
                                name="tag"
                                className="block flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={tag}
                                onChange={(e) => handleChange(e, index, "tag")}
                                placeholder="태그를 입력하셔유"
                                required
                            />
                            {/* 2개 이상일 때만 삭제 버튼 표시 */}
                            {recipe.tag.length > 1 && (
                                <button
                                    className="bg-red-500 text-white px-2 py-1 ml-2 rounded-lg hover:bg-red-800 transition duration-200"
                                    onClick={() => removeField("tag", index)}
                                    type="button"
                                >
                                    삭제
                                </button>
                            )}
                        </div>
                    ))}
                    <button
                        className="bg-gray-800 text-gray-300 px-4 py-2 ml-2 rounded-lg hover:bg-gray-100 transition duration-300"
                        onClick={() => addField("tag")}
                        type="button"
                    >
                        추가
                    </button>
                </div>

                {/* 재료 입력 폼 */}
                <div className="mb-6">
                    <label className="block text-xl font-semibold mb-2 text-gray-700">재료</label>
                    {recipe.ingredients.map((ingredient, index) => (
                        <div key={index} className="flex items-center mb-3">
                            <input
                                type="text"
                                name="ingredients"
                                className="block flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                value={ingredient}
                                onChange={(e) => handleChange(e, index, "ingredients")}
                                placeholder="재료를 입력하셔유"
                                required
                            />
                            {/* 2개 이상일 때만 삭제 버튼 표시 */}
                            {recipe.ingredients.length > 1 && (
                                <button
                                    className="bg-red-500 text-white px-2 py-1 ml-2 rounded-lg hover:bg-red-600 transition duration-200"
                                    onClick={() => removeField("ingredients", index)}
                                    type="button"
                                >
                                    삭제
                                </button>
                            )}
                        </div>
                    ))}
                    <button
                        className="bg-gray-800 text-gray-300 px-4 py-2 ml-2 rounded-lg hover:bg-gray-100 transition duration-300"
                        onClick={() => addField("ingredients")}
                        type="button"
                    >
                        추가
                    </button>
                </div>

                {/* 과정 입력 폼 */}
                <div className="mb-6">
                    <label className="block text-xl font-semibold mb-2 text-gray-700">과정</label>
                    {recipe.process.map((step, index) => (
                        <div key={index} className="flex items-center mb-3">
                            <input
                                type="text"
                                name="process"
                                className="block flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                value={step}
                                onChange={(e) => handleChange(e, index, "process")}
                                placeholder="과정을 입력하셔유"
                                required
                            />
                            {/* 2개 이상일 때만 삭제 버튼 표시 */}
                            {recipe.process.length > 1 && (
                                <button
                                    className="bg-red-500 text-white px-2 py-1 ml-2 rounded-lg hover:bg-red-600 transition duration-200"
                                    onClick={() => removeField("process", index)}
                                    type="button"
                                >
                                    삭제
                                </button>
                            )}
                        </div>
                    ))}
                    <button
                        className="bg-gray-800 text-gray-300 px-4 py-2 ml-2 rounded-lg hover:bg-gray-100 transition duration-300"
                        onClick={() => addField("process")}
                        type="button"
                    >
                        추가
                    </button>
                </div>

                {/* 로컬 스토리지에 저장하는 버튼 */}
                <button
                    className="w-full bg-emerald-700 text-white py-2 rounded-lg hover:bg-red-800 transition duration-200"
                    onClick={saveToLocalStorage}
                    type="button"
                >
                    레시피 저장
                </button>
            </div>
        </div>
    );
}
