import React from 'react'
import Hero from '../components/Hero'
import Navbar from '../components/Navbar'
import Green_section from '../components/Green_section'
import Footer from '../components/Footer'
import Testimonials from '../components/Article'



function home() {
  return ( 
    <>
      <Navbar />
      <Hero />
      <Green_section />
      <Testimonials />
      <Footer />
    </>
  )
}

export default home