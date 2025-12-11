export default function Contact() {
  const members = [
    { name: "Max Kwatcher", email: "mkwatcher@csu.fullerton.edu" },
    { name: "Adan Jeronimo", email: "ajjeroni@csu.fullerton.edu" },
    { name: "John Alora", email: "jalora@csu.fullerton.edu" },
    { name: "Sean Lowery", email: "slowery@csu.fullerton.edu" },
    { name: "Tegh Singh", email: "ssingh48@csu.fullerton.edu" },
    { name: "Rami Semrin", email: "rsemrin@csu.fullerton.edu" },
  ];

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-xl space-y-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-slate-950/40">
        <h1 className="text-2xl font-semibold text-slate-50 text-center">
          Team Contacts
        </h1>
        <p className="text-center text-sm text-slate-400">
          Click any name to email a team member.
        </p>

        <ul className="space-y-3">
          {members.map((m) => (
            <li
              key={m.email}
              className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-950/60 px-4 py-3 hover:border-brand-500/60 transition"
            >
              <span className="text-slate-200 font-medium text-sm">
                {m.name}
              </span>

              <a
                href={`mailto:${m.email}`}
                className="text-xs text-brand-400 hover:text-brand-300 underline-offset-2 hover:underline"
              >
                {m.email}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
