export const Loader = () => {
    return (
      <div className="flex flex-row space-x-2 justify-center items-center bg-white h-screen dark:invert">
        <div className="loader__main">
          <div className="h-8 w-8 bg-black rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="h-8 w-8 bg-black rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="h-8 w-8 bg-black rounded-full animate-bounce"></div>
        </div>
      </div>
    )
};