"use client";

import { useState, useEffect, useMemo } from "react";
import { Todo, Step } from "@/types/todo";
import { 
  Sun, 
  Star, 
  Inbox, 
  Search, 
  Trash2, 
  Calendar, 
  Plus, 
  CheckCircle2, 
  Circle,
  X,
  Clock,
  ChevronRight
} from "lucide-react";

const STORAGE_KEY = "premium-todo-segmented-v9";

const colorVariants = {
  none: "border-transparent bg-white",
  red: "border-red-400 bg-red-50/20",
  blue: "border-blue-400 bg-blue-50/20",
  green: "border-green-400 bg-green-50/20",
  yellow: "border-yellow-400 bg-yellow-50/20",
  purple: "border-purple-400 bg-purple-50/20",
};

const colorTagVariants = {
  none: "bg-slate-100",
  red: "bg-red-400",
  blue: "bg-blue-400",
  green: "bg-green-400",
  yellow: "bg-yellow-400",
  purple: "bg-purple-400",
};

type SortOption = "importance" | "newest" | "name";

const getLocalTodayString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<"all" | "myday" | "important">("all");
  const [selectedTodoId, setSelectedTodoId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("importance");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setTodos(JSON.parse(saved));
      } catch (e) {
        console.error("복구 실패:", e);
        setTodos([]);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    }
  }, [todos, isLoaded]);

  useEffect(() => {
    setSelectedTodoId(null);
  }, [activeCategory, searchQuery]);

  const selectedTodo = useMemo(() => 
    todos.find((t) => t.id === selectedTodoId) || null,
    [todos, selectedTodoId]
  );

  const updateTodo = (id: string, updates: Partial<Todo>) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates, updatedAt: Date.now() } : t))
    );
  };

  const addTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const now = Date.now();
    const todayStr = getLocalTodayString();
    const isAddingToMyDay = activeCategory === "myday";
    
    const newTodo: Todo = {
      id: crypto.randomUUID(),
      text: inputValue.trim(),
      completed: false,
      isImportant: activeCategory === "important",
      myDayDate: isAddingToMyDay ? todayStr : null,
      dueDate: isAddingToMyDay ? todayStr : null,
      note: "",
      steps: [],
      color: "none",
      createdAt: now,
      updatedAt: now,
    };

    setTodos([newTodo, ...todos]);
    setInputValue("");
  };

  const deleteTodo = (id: string) => {
    if (confirm("정말 삭제하시겠습니까?")) {
      setTodos((prev) => prev.filter((t) => t.id !== id));
      if (selectedTodoId === id) {
        setSelectedTodoId(null);
      }
    }
  };

  const todayStr = getLocalTodayString();
  const counts = useMemo(() => ({
    all: todos.length,
    myday: todos.filter(t => t.myDayDate === todayStr || t.dueDate === todayStr).length,
    important: todos.filter(t => t.isImportant).length,
  }), [todos, todayStr]);

  const todayProgress = useMemo(() => {
    const todayTodos = todos.filter(t => t.myDayDate === todayStr || t.dueDate === todayStr);
    if (todayTodos.length === 0) return 0;
    const completed = todayTodos.filter(t => t.completed).length;
    return (completed / todayTodos.length) * 100;
  }, [todos, todayStr]);

  const displayTodos = useMemo(() => {
    return todos
      .filter((todo) => {
        if (searchQuery.trim()) return todo.text.toLowerCase().includes(searchQuery.toLowerCase());
        if (activeCategory === "myday") return todo.myDayDate === todayStr || todo.dueDate === todayStr;
        if (activeCategory === "important") return todo.isImportant;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "importance") {
          if (a.isImportant && !b.isImportant) return -1;
          if (!a.isImportant && b.isImportant) return 1;
        }
        if (sortBy === "newest") return (b.createdAt || 0) - (a.createdAt || 0);
        if (sortBy === "name") return a.text.localeCompare(b.text);
        return 0;
      });
  }, [todos, activeCategory, searchQuery, sortBy, todayStr]);

  if (!isLoaded) return <div className="h-screen flex items-center justify-center bg-slate-50">로딩 중...</div>;

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-200 via-slate-100 to-slate-300 py-12 px-6 md:px-12 antialiased selection:bg-blue-100 text-slate-800">
      {/* Main Premium Card Container */}
      <div className="max-w-5xl mx-auto bg-white rounded-[40px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex overflow-hidden min-h-[800px] border border-white/60 relative transition-all duration-300 ease-in-out">
        
        {/* Main Interface Area: Shrinks/Grows dynamically */}
        <main className="flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out">
          
          {/* Header & Filter System */}
          <header className="px-16 pt-16 pb-8 space-y-10 shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 leading-none text-nowrap">할일 리스트</h1>
                <p className="text-[13px] font-bold text-slate-500 mt-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> {todayStr}
                </p>
              </div>
              <div className="relative group">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 transition-colors group-focus-within:text-blue-500" />
                <input
                  type="text"
                  placeholder="검색"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-slate-100/60 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all border-none w-40 md:w-48 focus:w-64"
                />
              </div>
            </div>

            {/* Segmented Control Filter */}
            <div className="flex flex-col gap-6">
              <div className="bg-slate-100/80 p-1.5 rounded-[22px] flex items-center max-w-md shadow-inner">
                {(["all", "myday", "important"] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`flex-1 flex items-center justify-center gap-2.5 py-3 rounded-[16px] text-sm font-bold transition-all ${
                      activeCategory === cat && !searchQuery
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {cat === "all" ? <Inbox className="w-4 h-4" /> : cat === "myday" ? <Sun className="w-4 h-4" /> : <Star className="w-4 h-4" />}
                    <span className="hidden sm:inline">{cat === "all" ? "전체" : cat === "myday" ? "오늘" : "중요"}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                      activeCategory === cat && !searchQuery ? "bg-blue-50" : "bg-slate-200"
                    }`}>
                      {counts[cat]}
                    </span>
                  </button>
                ))}
              </div>

              {/* Today's Progress Bar */}
              <div className="space-y-2.5">
                <div className="flex justify-between items-end px-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">오늘의 진행률</span>
                  <span className="text-xs font-extrabold text-blue-500">{Math.round(todayProgress)}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-700 ease-out rounded-full shadow-[0_0_8px_rgba(59,130,246,0.3)]"
                    style={{ width: `${todayProgress}%` }}
                  />
                </div>
              </div>
            </div>
          </header>

          {/* Todo List Area */}
          <div className="flex-1 overflow-y-auto px-16 pb-16 space-y-8 scrollbar-hide">
            <form 
              onSubmit={addTodo} 
              className="group flex items-center bg-slate-50/80 border border-slate-100 rounded-2xl px-6 py-4 hover:border-slate-200 focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-500/10 focus-within:bg-white transition-all duration-300"
            >
              <Plus className="w-7 h-7 text-blue-500 mr-4 transition-transform group-focus-within:rotate-90" />
              <input
                type="text"
                placeholder="새로운 할 일을 입력하세요"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="flex-1 text-[19px] font-light focus:outline-none placeholder-slate-300 bg-transparent"
              />
            </form>

            <div className="space-y-4">
              <div className="flex justify-between items-center px-1">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">작업 목록</h3>
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="text-[11px] font-bold text-slate-500 bg-transparent border-none outline-none cursor-pointer hover:text-slate-700 transition-colors"
                >
                  <option value="importance">중요도순</option>
                  <option value="newest">최신순</option>
                  <option value="name">이름순</option>
                </select>
              </div>

              {displayTodos.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-28 text-center">
                  <div className="bg-slate-50 w-28 h-28 rounded-full flex items-center justify-center mb-8 shadow-inner">
                    <CheckCircle2 className="w-12 h-12 text-slate-200" />
                  </div>
                  <h4 className="text-3xl font-light tracking-tight text-slate-400 mb-3">
                    {searchQuery ? "검색 결과가 없습니다" : "할 일을 모두 마쳤습니다"}
                  </h4>
                  <p className="text-sm font-bold text-slate-500 opacity-60">
                    {searchQuery ? "다른 검색어를 입력해 보세요" : "오늘의 여유를 만끽하세요"}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {displayTodos.map((todo) => (
                    <div
                      key={todo.id}
                      onClick={() => setSelectedTodoId(todo.id)}
                      className={`flex items-center gap-5 p-5 rounded-[24px] cursor-pointer transition-all duration-300 border border-transparent hover:bg-slate-50/60 hover:shadow-[0_4px_20px_rgb(0,0,0,0.03)] group ${
                        colorVariants[todo.color]
                      } ${selectedTodoId === todo.id ? "bg-slate-50 border-slate-100 shadow-sm" : ""}`}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateTodo(todo.id, { completed: !todo.completed });
                        }}
                        className="shrink-0"
                      >
                        {todo.completed ? (
                          <CheckCircle2 className="w-7 h-7 text-blue-500" />
                        ) : (
                          <Circle className="w-7 h-7 text-slate-200 hover:text-blue-400 transition-colors" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={`text-[17px] font-semibold tracking-tight transition-all ${todo.completed ? "line-through text-slate-400 font-normal" : "text-slate-700"}`}>
                          {todo.text}
                        </p>
                        <div className="flex gap-4 text-xs text-slate-500 mt-1.5 font-bold">
                          {(todo.myDayDate === todayStr || todo.dueDate === todayStr) && (
                            <span className="flex items-center gap-1.5 text-blue-500/80">
                              <Sun className="w-3.5 h-3.5" /> 오늘
                            </span>
                          )}
                          {todo.dueDate && todo.dueDate !== todayStr && (
                            <span className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5" /> {todo.dueDate}
                            </span>
                          )}
                          {todo.steps.length > 0 && <span>{todo.steps.filter(s => s.completed).length}/{todo.steps.length} 단계</span>}
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateTodo(todo.id, { isImportant: !todo.isImportant });
                        }}
                        className={`transition-all duration-300 ${todo.isImportant ? "text-blue-500 scale-110" : "text-slate-200 group-hover:text-slate-300"}`}
                      >
                        <Star className={`w-5 h-5 ${todo.isImportant ? "fill-current" : ""}`} />
                      </button>
                      <ChevronRight className={`w-4 h-4 text-slate-200 transition-all ${selectedTodoId === todo.id ? "translate-x-1 opacity-100" : "opacity-0 group-hover:opacity-100"}`} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>

        {/* 3. Push Layout Inspector Panel */}
        <aside className={`relative h-full bg-white border-l border-slate-100 transition-all duration-400 ease-out flex flex-col shadow-[-40px_0_80px_rgba(0,0,0,0.03)] ${
          selectedTodo ? "w-96 opacity-100" : "w-0 opacity-0 overflow-hidden"
        }`}>
          <div className={`flex flex-col h-full w-96 transition-opacity duration-300 ${selectedTodo ? "opacity-100 delay-150" : "opacity-0"}`}>
            {selectedTodo && (
              <>
                <header className="px-10 py-12 flex justify-between items-center shrink-0 border-b border-slate-50/50">
                  <h3 className="text-2xl font-extrabold tracking-tight text-slate-900">상세 정보</h3>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateTodo(selectedTodo.id, { isImportant: !selectedTodo.isImportant })}
                      className="w-11 h-11 flex items-center justify-center rounded-2xl hover:bg-slate-100 transition-all"
                      title="중요 표시"
                    >
                      <Star className={`w-5 h-5 transition-all duration-300 ${selectedTodo.isImportant ? "text-amber-400 fill-current scale-110" : "text-slate-300 hover:text-amber-300"}`} />
                    </button>
                    <button 
                      onClick={() => setSelectedTodoId(null)} 
                      className="w-11 h-11 flex items-center justify-center bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 hover:text-slate-700 transition-all"
                      title="닫기"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </header>

                <div className="flex-1 overflow-y-auto px-10 pb-12 space-y-12 scrollbar-hide">
                  {/* Title Card */}
                  <div className="bg-slate-50/80 p-7 rounded-[28px] border border-slate-100/50 flex items-start gap-5 mt-10">
                    <button onClick={() => updateTodo(selectedTodo.id, { completed: !selectedTodo.completed })} className="mt-1">
                      {selectedTodo.completed ? <CheckCircle2 className="w-7 h-7 text-blue-500" /> : <Circle className="w-7 h-7 text-slate-300" />}
                    </button>
                    <textarea
                      value={selectedTodo.text}
                      onChange={(e) => updateTodo(selectedTodo.id, { text: e.target.value })}
                      className="flex-1 bg-transparent font-bold text-[19px] resize-none focus:outline-none leading-relaxed text-slate-800"
                      rows={2}
                    />
                  </div>

                  {/* Steps Section */}
                  <div className="space-y-6">
                    <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest pl-1">하위 단계</h4>
                    <div className="space-y-4 bg-white p-2 rounded-2xl">
                      {selectedTodo.steps.map((step) => (
                        <div key={step.id} className="flex items-center gap-4 group px-3 py-1">
                          <button
                            onClick={() => {
                              const newSteps = selectedTodo.steps.map((s) => s.id === step.id ? { ...s, completed: !s.completed } : s);
                              updateTodo(selectedTodo.id, { steps: newSteps });
                            }}
                          >
                            {step.completed ? <CheckCircle2 className="w-5 h-5 text-blue-500" /> : <Circle className="w-5 h-5 text-slate-200" />}
                          </button>
                          <span className={`flex-1 text-[15px] font-bold ${step.completed ? "line-through text-slate-400 font-medium" : "text-slate-600"}`}>
                            {step.text}
                          </span>
                          <button
                            onClick={() => {
                              const newSteps = selectedTodo.steps.filter((s) => s.id !== step.id);
                              updateTodo(selectedTodo.id, { steps: newSteps });
                            }}
                            className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-400 transition-all"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <input
                        type="text"
                        placeholder="단계 추가"
                        onKeyDown={(e) => {
                          if (e.nativeEvent.isComposing) return;
                          if (e.key === "Enter" && e.currentTarget.value.trim()) {
                            const newStep: Step = { id: crypto.randomUUID(), text: e.currentTarget.value.trim(), completed: false };
                            updateTodo(selectedTodo.id, { steps: [...selectedTodo.steps, newStep] });
                            e.currentTarget.value = "";
                          }
                        }}
                        className="w-full bg-slate-50/50 py-4 px-5 rounded-2xl text-[13px] focus:outline-none font-bold placeholder-slate-300 border border-slate-100/50"
                      />
                    </div>
                  </div>

                  {/* Date & Meta Section (Refined with Pill Button) */}
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center h-7 transition-all duration-500">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest pl-1">기한 설정</label>
                        <div className={`transition-all duration-500 ease-out flex items-center ${
                          (selectedTodo.myDayDate === todayStr || selectedTodo.dueDate === todayStr) 
                            ? 'opacity-0 translate-x-2 pointer-events-none' 
                            : 'opacity-100 translate-x-0'
                        }`}>
                          <button
                            onClick={() => {
                              updateTodo(selectedTodo.id, { myDayDate: todayStr, dueDate: todayStr });
                            }}
                            className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-[11px] font-extrabold hover:bg-blue-200 cursor-pointer shadow-sm transition-all"
                          >
                            오늘
                          </button>
                        </div>
                      </div>
                      <input
                        type="date"
                        value={selectedTodo.dueDate || ""}
                        onChange={(e) => updateTodo(selectedTodo.id, { dueDate: e.target.value || null })}
                        className="w-full bg-slate-50/50 p-5 rounded-2xl text-[14px] focus:outline-none font-bold text-slate-700 border border-slate-100/50"
                      />
                    </div>

                    <div className="space-y-4">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest pl-1">상세 메모</label>
                      <textarea
                        placeholder="메모를 작성하세요"
                        value={selectedTodo.note}
                        onChange={(e) => updateTodo(selectedTodo.id, { note: e.target.value })}
                        className="w-full p-6 bg-slate-50/50 rounded-[28px] text-[14px] text-slate-700 focus:outline-none min-h-[180px] resize-none leading-relaxed border border-slate-100/50 font-medium"
                      />
                    </div>
                  </div>

                  {/* Colors */}
                  <div className="space-y-5">
                    <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest pl-1">태그 색상</h4>
                    <div className="flex justify-between items-center bg-slate-50/30 p-5 rounded-3xl border border-slate-100/30">
                      {(["none", "red", "blue", "green", "yellow", "purple"] as const).map((c) => (
                        <button
                          key={c}
                          onClick={() => updateTodo(selectedTodo.id, { color: c })}
                          className={`w-9 h-9 rounded-full transition-all duration-300 ${colorTagVariants[c]} ${
                            selectedTodo.color === c ? "ring-4 ring-offset-2 ring-blue-500 scale-110 shadow-lg" : "hover:scale-110 shadow-sm"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <footer className="px-10 py-10 border-t border-slate-50 flex justify-between items-center bg-slate-50/30 shrink-0">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">생성일</span>
                    <span className="text-xs font-black text-slate-400">{new Date(selectedTodo.createdAt).toLocaleDateString()}</span>
                  </div>
                  <button
                    onClick={() => deleteTodo(selectedTodo.id)}
                    className="px-7 py-3 bg-slate-100 text-slate-400 rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all font-black text-xs flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" /> 항목 삭제
                  </button>
                </footer>
              </>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
