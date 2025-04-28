import Navbar from "../../components/Navbar";

export default function Home() {
    return (
        <>
            <Navbar />
            <main className="bg-gray-100 py-3 h-full">
                <header className="flex bg-[#78D1F1] place-content-start place-items-center mx-6  rounded-lg ">
                    <div className=" ml-15 Poppins w-[600px] font-semibold text-center text-white absolute z-10">
                        <h2 className="text-5xl text-blue-950 leading-12">Better Life Through</h2>
                        <h1 className="text-8xl text-blue-950">Better Health</h1>
                        <p className="text-blue-950 mt-5 text-[16px] font-normal line-clamp-3 tracking-wider">Experience smarter healthcare—book appointments, get medicine reminders, predict illnesses, and summarize reports with our powerful AI-driven platform.</p>
                    </div>
                    <div className="w-full flex place-content-end">
                        <img className=" w-[900px] h-[620px] rotate-y-180 rounded-lg mask-r-from-25%" src="header.png" alt="header image" />
                    </div>
                </header>
            </main>
        </>

    );
}