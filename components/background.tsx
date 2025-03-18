export const Bg = () => {
  return (
    <div id="background_container" className={`group bg-white z-[-1] w-full h-screen fixed top-0 left-0`}>
      <div className="bg-black rounded-full absolute filter blur-md w-[50vh] h-[50vh] top-[-30vh] left-[-55vw] lg:top-[-210vh] lg:left-[-125vw] invisible"></div>
      <div className="bg-black rounded-full absolute filter blur-lg w-[115%] aspect-square  top-[-20%] left-[-20%] lg:top-[50vw] lg:left-[50vw]"></div>
      <div className="bg-black rounded-full absolute filter blur-lg w-[200vw] h-[200vw] top-[250vw] left-[-20vw]"></div>
      <div className="bg-black rounded-full absolute filter blur-lg w-[15vw] h-[15vw] top-[60vw] left-[32vw] lg:top-[0vw] lg:left-[-15vw] animate-[--small-circle-1-mobile] lg:animate-[--small-circle-1]" id="smallCircleOne"></div>
      <div className="bg-black rounded-full absolute filter blur-lg w-[15vw] h-[15vw] top-[140vw] left-[120vw] " id="smallCircleTwo"></div>
      <div className="bg-black rounded-full absolute filter blur-lg w-[15vw] h-[15vw] top-[330vw] left-[60vw] " id="smallCircleThree"></div>
    </div>
  )

}