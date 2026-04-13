import React from 'react'

import '../pages/register.css'
function register() {
  return (
    <>
    <div className="form_container">
    <div className="div_image">
      
    </div>
    <form>
      <input type="text" placeholder="Username" />
      <input type="email" placeholder="Email" />
      <input type="tel" placeholder="Téléphone" /> 
      <input type="password" placeholder="Mot de passe" />
      <button type="submit" className="submit">S'inscrire</button>
      <p>Vous avez déjà un compte ? <a href="/login">Se connecter</a></p>
      <p><a href="/">Retour à l'accueil</a></p>

    </form>
    </div>
    </>
  )
}

export default register