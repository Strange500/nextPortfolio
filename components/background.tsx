export const Bg = () => {
  return (
    <div id="background_container" className={`group bg-white z-[-1] w-full h-screen fixed top-0 left-0`}>
      <div className="bg-black rounded-full absolute filter blur-xl w-[200vw] h-[200vw] top-[-210vh] left-[-125vw]"></div>
      <div className="bg-black rounded-full absolute filter blur-xl w-[200vw] h-[200vw] top-[50vw] left-[50vw]"></div>
      <div className="bg-black rounded-full absolute filter blur-xl w-[200vw] h-[200vw] top-[250vw] left-[-20vw]"></div>
      <div className="bg-black rounded-full absolute filter blur-xl w-[15vw] h-[15vw] top-[2vw] left-[-22.5vw]  animate-[--small-circle-1]" id="smallCircleOne"></div>
      <div className="bg-black rounded-full absolute filter blur-xl w-[15vw] h-[15vw] top-[140vw] left-[120vw] " id="smallCircleTwo"></div>
      <div className="bg-black rounded-full absolute filter blur-xl w-[15vw] h-[15vw] top-[330vw] left-[60vw] " id="smallCircleThree"></div>
    </div>
  )

}