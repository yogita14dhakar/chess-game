export const Button = ({onClick, content}: {onClick: () => void, content:  React.ReactNode;}) => {
    return (
        <button onClick={onClick} className=" py-4 px-8 bg-[#e64833]/80 text-lg md:text-2xl text-[#d1e8e2] hover:bg-[#e64833] font-bold rounded">
            {content}
        </button>
    )
}