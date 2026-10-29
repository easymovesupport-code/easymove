import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { ArrowRight, Send } from "lucide-react";

const Chat = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const bottomRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [request, setRequest] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadMessages = async () => {
    const { data, error: msgError } = await supabase
      .from("messages")
      .select("*")
      .eq("request_id", requestId)
      .order("created_at", { ascending: true });

    if (msgError) {
      console.error(msgError);
      return;
    }
    setMessages(data || []);
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");

      const { data: authData } = await supabase.auth.getUser();
      if (!authData?.user) {
        navigate("/login?type=volunteer");
        return;
      }

      const { data: userRow } = await supabase
        .from("users")
        .select("id, name, email, user_type")
        .eq("email", authData.user.email)
        .maybeSingle();

      if (!userRow) {
        setError("تعذر تحميل المستخدم");
        setLoading(false);
        return;
      }
      setUser(userRow);

      const { data: reqRow, error: reqError } = await supabase
        .from("help_requests")
        .select("*")
        .eq("id", requestId)
        .maybeSingle();

      if (reqError || !reqRow) {
        setError("الطلب غير موجود");
        setLoading(false);
        return;
      }

      // المتطوع فقط إذا كان هو من قبل الطلب
      if (
        userRow.user_type === "volunteer" &&
        reqRow.volunteer_id !== userRow.id
      ) {
        setError("غير مصرح لك بالدخول لهذه المحادثة");
        setLoading(false);
        return;
      }

      if (reqRow.status !== "accepted" && reqRow.status !== "completed") {
        setError("المحادثة متاحة بعد قبول الطلب");
        setLoading(false);
        return;
      }

      setRequest(reqRow);
      await loadMessages();
      setLoading(false);
    };

    load();
  }, [requestId, navigate]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // تحديث بسيط كل 5 ثوانٍ
  useEffect(() => {
    if (!requestId) return;
    const timer = setInterval(() => {
      loadMessages();
    }, 5000);
    return () => clearInterval(timer);
  }, [requestId]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || !user) return;

    setSending(true);
    setError("");

    const body = text.trim();
    setText("");

    const { error: sendError } = await supabase.from("messages").insert([
      {
        request_id: requestId,
        sender_id: user.id,
        body,
      },
    ]);

    setSending(false);

    if (sendError) {
      console.error(sendError);
      setError("تعذر إرسال الرسالة");
      setText(body);
      return;
    }

    await loadMessages();
  };

  if (loading) {
    return (
      <div
        className='min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50 flex items-center justify-center'
        dir='rtl'
      >
        <p className='text-slate-500'>جاري فتح المحادثة...</p>
      </div>
    );
  }

  return (
    <div
      className='min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50 flex flex-col'
      dir='rtl'
    >
      <header className='bg-white/90 backdrop-blur border-b border-teal-100 sticky top-0 z-40'>
        <div className='max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between'>
          <Link
            to='/volunteer/dashboard'
            className='inline-flex items-center gap-2 text-slate-600 hover:text-teal-700 text-sm font-medium'
          >
            <ArrowRight size={18} />
            رجوع
          </Link>
          <div className='text-center'>
            <p className='font-bold text-slate-900 text-sm'>
              {request?.title || "محادثة"}
            </p>
            <p className='text-xs text-slate-500'>{request?.help_type}</p>
          </div>
          <span className='text-lg font-bold text-teal-800'>
            Easy<span className='text-teal-500'>Move</span>
          </span>
        </div>
      </header>

      <main className='flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-4 flex flex-col'>
        {error && (
          <div className='bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100 mb-4'>
            {error}
          </div>
        )}

        <div className='flex-1 bg-white/90 border border-teal-100 rounded-3xl shadow-sm overflow-hidden flex flex-col min-h-[60vh]'>
          <div className='flex-1 overflow-y-auto p-4 space-y-3'>
            {messages.length === 0 ? (
              <div className='h-full flex items-center justify-center text-slate-400 text-sm'>
                لا توجد رسائل بعد. ابدأ المحادثة.
              </div>
            ) : (
              messages.map((msg) => {
                const mine = msg.sender_id === user?.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex ${mine ? "justify-start" : "justify-end"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                        mine
                          ? "bg-gradient-to-l from-teal-600 to-cyan-600 text-white rounded-br-md"
                          : "bg-stone-100 text-slate-800 rounded-bl-md"
                      }`}
                    >
                      <p>{msg.body}</p>
                      <p
                        className={`text-[10px] mt-1 ${
                          mine ? "text-teal-100" : "text-slate-400"
                        }`}
                      >
                        {new Date(msg.created_at).toLocaleTimeString("ar-SA", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={bottomRef} />
          </div>

          <form
            onSubmit={handleSend}
            className='border-t border-stone-100 p-3 flex items-center gap-2 bg-white'
          >
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder='اكتب رسالتك...'
              className='flex-1 px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none text-sm'
            />
            <button
              type='submit'
              disabled={sending || !text.trim()}
              className='shrink-0 w-12 h-12 rounded-xl bg-gradient-to-l from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 disabled:opacity-50 text-white flex items-center justify-center shadow-md shadow-teal-700/20 transition-all'
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Chat;
