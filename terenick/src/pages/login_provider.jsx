import './provider.css'

function LoginProvider() {
  return (
    
    <>
    <div className="provider-container">
      <div className="img_div">
        
      </div>
        <form action="">
            <input type="text" placeholder="Email" />
            <input type="password" placeholder="Password" />
            <a href="#">Mot de passe oublié?</a>
            <br />
            <p>Vous n'avez pas de compte? <a href="#">S'inscrire</a></p>
            <button type="submit">Login</button>
           
        </form>
    </div>
    
    </>


  )
}

export default LoginProvider