function App() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-6 px-6 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          React + Tailwind + Vite
        </h1>
        <p className="max-w-xl text-base text-slate-300 sm:text-lg">
          Your project is ready. Edit <code>src/App.jsx</code> to start
          building.
        </p>
        <a
          href="https://tailwindcss.com/docs/installation/using-vite"
          target="_blank"
          rel="noreferrer"
          className="rounded-lg bg-cyan-500 px-4 py-2 font-medium text-slate-950 transition hover:bg-cyan-400"
        >
          Tailwind Docs
        </a>
      </div>
    </main>
  )
}

export default App
