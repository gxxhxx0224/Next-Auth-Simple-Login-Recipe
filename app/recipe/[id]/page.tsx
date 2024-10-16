'use client';
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

interface RecipeDetailProps {
    title: string;
    tag: string[];
    ingredients: string[];
    process: string[];
    version: number;
    time: string;
    timestamp: string; // 수정 또는 저장 시간을 기록하는 필드
}

export default function RecipeDetail() {
    const [times, setTimes] = useState<string[]>([]);
    const [recipe, setRecipe] = useState<RecipeDetailProps | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedRecipe, setEditedRecipe] = useState<RecipeDetailProps | null>(null);
    const router = useRouter();
    const searchParams = useSearchParams();
    const { data: session } = useSession();
    const [seconds, setSeconds] = useState<number[]>([]);
    const [isRunning, setIsRunning] = useState<boolean[]>([]);
    const [history, setHistory] = useState<RecipeDetailProps[]>([]);

    useEffect(() => {
        const recipeQuery = searchParams.get('recipe');
        if (recipeQuery) {
            try {
                const parsedRecipe = JSON.parse(recipeQuery);
                setRecipe(parsedRecipe);
                setEditedRecipe(parsedRecipe);

                if (session) {
                    const savedRecipes = localStorage.getItem(JSON.stringify(session.user!.email!));
                    if (savedRecipes) {
                        const parsedRecipes: RecipeDetailProps[] = JSON.parse(savedRecipes);
                        const historyRecipes = parsedRecipes.filter(r => r.title === parsedRecipe.title);
                        setHistory(historyRecipes);
                    }
                }
            } catch (error) {
                console.error("파싱 중 오류가 발생했어유:", error);
            }
        }
    }, [searchParams, session]);

    useEffect(() => {
        const timers: NodeJS.Timeout[] = [];
        seconds.forEach((sec, index) => {
            if (sec !== null && sec > 0 && isRunning[index]) {
                const timer = setTimeout(() => {
                    const updatedSeconds = [...seconds];
                    updatedSeconds[index] = sec - 1;
                    setSeconds(updatedSeconds);
                }, 1000);
                timers.push(timer);
            } else if (sec === 0 && isRunning[index]) {
                alert(`${index + 1}번 조리과정이 종료됐어유!`);
                const updatedIsRunning = [...isRunning];
                updatedIsRunning[index] = false;
                setIsRunning(updatedIsRunning);
            }
        });

        return () => timers.forEach(timer => clearTimeout(timer));
    }, [seconds, isRunning]);

    const handleDelete = () => {
        if (confirm("정말로 이 레시피 삭제하실거에유?")) {
            if (session) {
                const savedRecipes = localStorage.getItem(JSON.stringify(session.user!.email!));
                if (savedRecipes) {
                    const parsedRecipes = JSON.parse(savedRecipes);
                    const updatedRecipes = parsedRecipes.filter((r: RecipeDetailProps) => r.title !== recipe?.title);
                    localStorage.setItem(JSON.stringify(session.user?.email), JSON.stringify(updatedRecipes));
                    alert("흑백레시피가 삭제되었어유.");
                    router.push('/');
                }
            }
        }
    };

    // 필드가 빈 값인지 확인하는 함수
    const isFieldEmpty = (fields: string[]) => {
        return fields.some(field => field.trim() === "");
    };

    const handleEdit = () => {
        // 필수 필드가 비어 있는지 검증
        if (!editedRecipe?.title.trim()) {
            alert("레시피 제목을 입력하셔유.");
            return;
        }
        if (isFieldEmpty(editedRecipe?.tag || [])) {
            alert("모든 태그를 입력하셔유.");
            return;
        }
        if (isFieldEmpty(editedRecipe?.ingredients || [])) {
            alert("모든 재료를 입력하셔유.");
            return;
        }
        if (isFieldEmpty(editedRecipe?.process || [])) {
            alert("모든 조리 과정을 입력하셔유.");
            return;
        }

        if (session && editedRecipe) {
            const savedRecipes = localStorage.getItem(JSON.stringify(session.user!.email!));
            if (savedRecipes) {
                const parsedRecipes: RecipeDetailProps[] = JSON.parse(savedRecipes);

                // 현재 시간을 가져옴
                const currentTimestamp = new Date().toLocaleString();

                // 새로운 버전으로 변경된 레시피를 생성하면서 timestamp 추가
                const newVersionRecipe = { ...editedRecipe, version: editedRecipe.version + 1, timestamp: currentTimestamp };

                // 기존 레시피 배열에 새로운 버전의 레시피만 추가 (기존 레시피는 수정하지 않음)
                const updatedRecipes = [...parsedRecipes, newVersionRecipe];

                // 수정된 배열을 로컬 스토리지에 저장
                localStorage.setItem(JSON.stringify(session.user?.email), JSON.stringify(updatedRecipes));

                alert("레시피가 이븐하게 수정됐어요.");
                setIsEditing(false);
                setRecipe(newVersionRecipe); // 현재 레시피 상태는 최신 버전으로 업데이트
                setHistory(updatedRecipes.filter(r => r.title === newVersionRecipe.title)); // 히스토리 업데이트
            }
        }
    };

    const restoreVersion = (version: number) => {
        const selectedVersion = history.find(r => r.version === version);
        if (selectedVersion) {
            setRecipe(selectedVersion);
            setEditedRecipe(selectedVersion);
            alert(`버전 ${version}으로 복구되었어유.`);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (editedRecipe) {
            const { name, value } = e.target;
            setEditedRecipe({ ...editedRecipe, [name]: value });
        }
    };

    const handleArrayChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        index: number,
        field: "tag" | "ingredients" | "process"
    ) => {
        if (editedRecipe) {
            const { value } = e.target;
            const updatedArray = [...(editedRecipe[field] as string[])];
            updatedArray[index] = value;
            setEditedRecipe({ ...editedRecipe, [field]: updatedArray });
        }
    };

    const handleAddField = (field: "tag" | "ingredients" | "process") => {
        if (editedRecipe) {
            const updatedArray = [...(editedRecipe[field] as string[])];
            updatedArray.push("");
            setEditedRecipe({ ...editedRecipe, [field]: updatedArray });
        }
    };

    const handleRemoveField = (field: "tag" | "ingredients" | "process", index: number) => {
        if (editedRecipe) {
            const updatedArray = [...(editedRecipe[field] as string[])];
            updatedArray.splice(index, 1);
            setEditedRecipe({ ...editedRecipe, [field]: updatedArray });
        }
    };

    const startTimer = (index: number) => {
        const timeInSeconds = parseInt(times[index], 10);
        if (!isNaN(timeInSeconds)) {
            const updatedSeconds = [...seconds];
            updatedSeconds[index] = timeInSeconds;
            setSeconds(updatedSeconds);

            const updatedIsRunning = [...isRunning];
            updatedIsRunning[index] = true;
            setIsRunning(updatedIsRunning);
        } else {
            alert('시간을 입력하세유');
        }
    };

    if (!recipe || !editedRecipe) {
        return <div>레시피를 불러오지 못했어유.</div>;
    }

    return (
        <div className="min-h-screen flex flex-col items-center bg-gray-100 py-10">
            <h1 className="text-4xl font-bold mb-8 text-gray-800">{isEditing ? "레시피 수정" : recipe.title}</h1>

            <div className="w-full max-w-4xl bg-white shadow-md rounded-lg p-6 mb-6 border border-gray-200">
                {isEditing ? (
                    <div>
                        <div className="mb-4">
                            <label className="block text-lg font-semibold mb-2">제목</label>
                            <input
                                className="form-control w-full"
                                name="title"
                                value={editedRecipe.title}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {/* 태그 수정 폼 */}
                        <div className="mb-4">
                            <label className="block text-lg font-semibold mb-2">태그</label>
                            {editedRecipe.tag.map((tag, index) => (
                                <div key={index} className="flex mb-2 items-center">
                                    <input
                                        className="form-control pl-2 border"
                                        value={tag}
                                        onChange={(e) => handleArrayChange(e, index, 'tag')}
                                        required
                                    />
                                    <div className="flex mx-2">
                                        {editedRecipe.tag.length > 1 && (
                                            <button
                                                className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600"
                                                onClick={() => handleRemoveField('tag', index)}
                                            >
                                                삭제
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                            <button
                                className="bg-gray-800 text-gray-300 px-4 py-2 ml-2 rounded-lg hover:bg-gray-100 transition duration-300"
                                onClick={() => handleAddField('tag')}
                            >
                                추가
                            </button>
                        </div>

                        {/* 재료 수정 폼 */}
                        <div className="mb-4">
                            <label className="block text-lg font-semibold mb-2">재료</label>
                            {editedRecipe.ingredients.map((ingredient, index) => (
                                <div key={index} className="flex items-center mb-2">
                                    <input
                                        className="form-control pl-2 border"
                                        value={ingredient}
                                        onChange={(e) => handleArrayChange(e, index, 'ingredients')}
                                        required
                                    />
                                    <div className="flex mx-2">
                                        {editedRecipe.ingredients.length > 1 && (
                                            <button
                                                className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600"
                                                onClick={() => handleRemoveField('ingredients', index)}
                                            >
                                                삭제
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                            <button
                                className="bg-gray-800 text-gray-300 px-4 py-2 ml-2 rounded-lg hover:bg-gray-100 transition duration-300"
                                onClick={() => handleAddField('ingredients')}
                            >
                                추가
                            </button>
                        </div>

                        {/* 조리 과정 수정 폼 */}
                        <div className="mb-4">
                            <label className="block text-lg font-semibold mb-2">조리 과정</label>
                            {editedRecipe.process.map((step, index) => (
                                <div key={index} className="flex items-center mb-2">
                                    <input
                                        className="form-control pl-2 border"
                                        value={step}
                                        onChange={(e) => handleArrayChange(e, index, 'process')}
                                        required
                                    />
                                    <div className="flex mx-2">
                                        {editedRecipe.process.length > 1 && (
                                            <button
                                                className="bg-red-500 text-white px-3 py-1 ml-2 rounded-lg hover:bg-red-600"
                                                onClick={() => handleRemoveField('process', index)}
                                            >
                                                삭제
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                            <button
                                className="bg-gray-800 text-gray-300 px-4 py-2 ml-2 rounded-lg hover:bg-gray-100 transition duration-300"
                                onClick={() => handleAddField('process')}
                            >
                                추가
                            </button>
                        </div>

                        {/* 수정 및 취소 버튼 */}
                        <div className="flex justify-between">
                            <button
                                className="bg-gray-800 text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-100"
                                onClick={handleEdit}
                            >
                                수정 완료
                            </button>
                            <button
                                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                                onClick={() => setIsEditing(false)}
                            >
                                취소
                            </button>
                        </div>
                    </div>
                ) : (
                    <div>
                        {/* 과정 표시 */}
                        <div className="mb-4">
                            <h2 className="text-2xl font-bold mb-3">현재 레시피 버전: V{recipe.version}</h2>
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">조리 과정</h3>
                            <ul className="ml-6">
                                {recipe.process.map((step, index) => (
                                    <div key={index}>
                                        <div className="flex items-center text-bold">
                                            Step {index + 1}: {step}
                                        </div>
                                        <input
                                            className="rounded-lg mr-2 pl-2 border w-20"
                                            placeholder="시간(초)"
                                            value={times[index]}
                                            onChange={(e) => {
                                                const updatedTimes = [...times];
                                                updatedTimes[index] = e.target.value;
                                                setTimes(updatedTimes);
                                            }}
                                        />
                                        <button
                                            className="rounded-lg px-3 mr-2 bg-gray-800 text-gray-300 hover:bg-gray-100"
                                            onClick={() => startTimer(index)}
                                        >
                                            타이머 시작
                                        </button>
                                        {isRunning[index] && <p>남은 시간: {seconds[index]} 초</p>}
                                    </div>
                                ))}
                            </ul>
                        </div>
                        {/* 태그 표시 */}
                        <div className="mb-4">
                            <div className="flex">
                                {recipe.tag.map((tag, index) => (
                                    <div key={index} className="rounded-lg px-3 py-1 bg-gray-400 mr-2">#{tag}</div>
                                ))}
                            </div>
                        </div>
                        {/* 재료 표시 */}
                        <div className="mb-4">
                            <h3 className="text-lg font-semibold text-gray-700">재료</h3>
                            <ul className="list-disc ml-6">
                                {recipe.ingredients.map((ingredient, index) => (
                                    <li key={index} className="text-gray-600">{ingredient}</li>
                                ))}
                            </ul>
                        </div>
                        {/* 조리 과정 표시 */}
                        <div className="mb-4">
                            <h3 className="text-lg font-semibold text-gray-700">조리 과정</h3>
                            <ul className="list-decimal ml-6">
                                {recipe.process.map((process, index) => (
                                    <li key={index} className="text-gray-600">{process}</li>
                                ))}
                            </ul>
                        </div>
                        {/* 수정 이력 및 복구 */}
                        <div>
                            <h3 className="text-lg font-semibold">수정 이력</h3>
                            <ul className="list-disc ml-6">
                                {history.map((r) => (
                                    <li key={r.version}>
                                        버전 {r.version} - {r.timestamp}{" "}
                                        <button
                                            className="text-blue-500 underline ml-2"
                                            onClick={() => restoreVersion(r.version)}
                                        >
                                            복구
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        {/* 수정, 삭제, 목록으로 돌아가기 버튼 */}
                        <div className="flex mt-6">
                            <button
                                className="bg-yellow-500 text-white px-4 py-2 mr-3 rounded-lg hover:bg-yellow-600"
                                onClick={() => setIsEditing(true)}
                            >
                                수정
                            </button>
                            <button
                                className="bg-red-500 text-white px-4 py-2 mr-3 rounded-lg hover:bg-red-600"
                                onClick={handleDelete}
                            >
                                삭제
                            </button>
                            <button
                                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                                onClick={() => router.push('/')}
                            >
                                목록으로
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
