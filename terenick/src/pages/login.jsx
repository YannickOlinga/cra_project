 
import './login.css'



function login() {
  return (
    <> 

    <div className="form_container">
    <div className="div_image">
      
    </div>
    <form>
      <input type="text" placeholder="Username" />
      <input type="password" placeholder="Mot de passe" />
      <button type="submit" className="submit">Se connecter</button>
      <p>Vous n'avez pas de compte ? <a href="/register">S'inscrire</a></p>
      <p>Mot de passe oublié ? <a href="/sidebar">Cliquez ici</a></p>
      <p><a href="/">Retour à l'accueil</a></p>

    </form>
    </div>
    </>
  )
}
 
export default login