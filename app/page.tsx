import { SmallSocialBtn } from '@/components/smallSocialBtn'
import Header from '@/components/Header'

export default function Page() {
  return (
  <section className="w-screen h-screen">

    <Header/>

    <div className="container mx-auto">
      <div className={` md:pt-60 pt-12 pt`}></div>
      <div className="flex justify-center md:justify-start ">
        <div className="flex flex-col justify-center text-center md:text-left mx-4 md:mx-0">
            <h1 className="text-2xl md:text-4xl font-semibold">
              Hi, I'm <span className="gradient-text">Benjamin Roget</span>
            </h1>
          <p className="text-lg text-gray-500">I'm a IT student from France</p>
        </div>
      </div>
      <SmallSocialBtn />
    </div>


  </section>
  )
}