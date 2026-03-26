import React from 'react'
import './Article.css'

const testimonials = [
  {
    id: 1,
    name: "Richard P.",
    company: "Keros Group",
    role: "Directeur",
    content: "Terenick a révolutionné notre gestion des comptes rendus d'activité. Nos consultants peuvent désormais renseigner leurs timesheets rapidement et de manière fluide, ce qui simplifie grandement le suivi du temps passé sur les projets. Cet outil nous permet d'avoir une visibilité claire et précise sur les activités de l'équipe, et il a réellement facilité notre gestion au quotidien.",
 
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
  },
  {
    id: 2,
    name: "Dylan D.",
    company: "Happy Hire",
    role: "Manager",
    content: "Nous recherchions un outil pour suivre l'activité de nos consultants chez nos clients : un outil simple et efficace pour toutes les parties. En plus de cela, Terenick a su s'adapter à notre besoin en étant à l'écoute et super réactif !",
 
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
  },
  {
    id: 3,
    name: "Nicolas V.",
    company: "Magento Developer",
    role: "Freelance",
    content: "SIMPLICITÉ ! Épuré, couleur simple, fonctionnel. Sans publicités. En tant que freelance, je n'utilise pas l'outil de saisie des temps de mes clients, mais toutefois il aime avoir le CRA associé à la facture en fin de mois, j'utilise donc Terenick.",
 
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face"
  },
  {
    id: 4,
    name: "Karen M.",
    company: "Ness Technologies",
    role: "Responsable projet",
    content: "En tant que cliente de Terenick, nous sommes pleinement satisfaits de cette solution de saisie des CRA. Terenick a su répondre aux besoins de nos consultants en proposant une interface épurée, conçue spécifiquement pour eux, rendant la tâche mensuelle de saisie beaucoup plus fluide et rapide.",

    avatar: "https://images.unsplash.com/photo-1494790108755-2616b332c1ca?w=100&h=100&fit=crop&crop=face"
  },
  {
    id: 5,
    name: "Messaoud H.",
    company: "Développeur Web & Formateur",
    role: "Freelance",
    content: "Terenick facilite la gestion des CRAs grâce à son interface intuitive et ses fonctionnalités de suivi détaillé (Jour travaillé/absent), optimisant ainsi notre efficacité administrative.",
    
    avatar: "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=100&h=100&fit=crop&crop=face"
  },
  {
    id: 6,
    name: "Mouad C.",
    company: "NexGen IT, LLC",
    role: "CTO",
    content: "Terenick a transformé notre suivi d'équipe avec des rapports clairs et précis, facilitant des décisions rapides et efficaces. Simple et efficace !",
 
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
  }
]

function Testimonials() {
 

  // Dupliquer les témoignages pour un défilement infini
  const duplicatedTestimonials = [...testimonials, ...testimonials]

  return (
    <section className="testimonials-section">
      <div className="container">
        <div className="testimonials-header">
          <h2>Ce que disent nos clients</h2>
          <p>Découvrez les témoignages de ceux qui utilisent Terenick au quotidien pour simplifier leur gestion de CRA</p>
        </div>
        
        <div className="marquee-container">
          <div className="marquee-track">
            {duplicatedTestimonials.map((testimonial, index) => (
              <article key={`${testimonial.id}-${index}`} className="testimonial-card">
                <div className="testimonial-header">
                  <img 
                    src={testimonial.avatar} 
                    alt={`${testimonial.name} avatar`}
                    className="testimonial-avatar"
                  />
                  <div className="testimonial-info">
                    <h3 className="testimonial-name">{testimonial.name}</h3>
                    <p className="testimonial-role">{testimonial.role}</p>
                    <p className="testimonial-company">{testimonial.company}</p>
                  </div>
               
                </div>
                
                <div className="testimonial-content">
                  <p>"{testimonial.content}"</p>
                </div>
              </article>
            ))}
          </div>
        </div>
        
        
      </div>
    </section>
  )
}

export default Testimonials