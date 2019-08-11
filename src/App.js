import React from 'react';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import logo from './Pokeball.png';
import 'bootstrap/dist/css/bootstrap.css';
import Container from 'react-bootstrap/Container'
import Nav from 'react-bootstrap/Nav'
import Navbar from 'react-bootstrap/Navbar'
import './App.css';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      isLoaded: false,      
      items: [],                         // Store a list of all pokemons
      url: "https://pokeapi.co/api/v2/", // API endpoint
      collectedPokemon: [],              // Store catched pokemon in an array of objects
      detailClicked: false,              // Used to determine whether to display catch button when pokemon is clicked
      pokemon: "",                       // Store currently viewed pokemon
      sequence: 0                        // For ID-ing catched pokemons
    };
  }

  // Do an AJAX call fetching a list of all pokemons
  componentDidMount() {
    fetch(this.state.url + "pokemon/?offset=0&limit=1000") //Offset tells us how many to exclude from the beginning of the result
      .then(res => res.json())
      .then(
        (result) => {
          this.setState({
            isLoaded: true,
            items: result
          });
        },
        // Note: it's important to handle errors here
        // instead of a catch() block so that we don't swallow
        // exceptions from actual bugs in components.
        (error) => {
          this.setState({
            isLoaded: true,
            error
          });
        }
      )
  }

  renderPokemonDetails() {
    return(
      <Route path="/PokemonDetails/:name" component={PokemonDetails} />
    )
  }

  setCurrentPokemon(name) {    
    this.setState(
      {
        detailClicked: true,
        pokemon: name,
      }
    );
  }

  hideCatchButton() {
    this.setState({detailClicked: false})
  }

  catchPokemon(name) {
    let chance = Math.floor(Math.random() * 2); //generates either 0 or 1
    let myPokemon = this.state.collectedPokemon;
    if (chance === 1) {
      this.setState({ownedTotal: this.state.collectedPokemon.length})
      let promptResult = prompt(`You have successfully caught a ${name}! Name your new pokemon` );
            
      // Add pokemon to pokemon collection
      myPokemon.splice(myPokemon.length, 0, {pokemonName: name, nickname: promptResult, id: this.state.sequence})
      this.setState({collectedPokemon: myPokemon})
      this.setState({sequence: this.state.sequence + 1})
      
    } else {
      alert(`Catch failed. Try again!`)
    }
  }

  removePokemon(nickname, id) {
    let ownedPokemon = this.state.collectedPokemon;
    ownedPokemon.splice(ownedPokemon.findIndex(pokemon => pokemon.nickname === nickname && pokemon.id === id), 1);
    this.setState({collectedPokemon: ownedPokemon})
  }

  renderPokemonList(list) {
    return (
      <div className="col-md-8 text-center">
      <h1>My Pok&eacute;mon List</h1>
      {list.length === 0 && <h3>You haven't caught any pok&eacute;mon</h3>}
      <table className="table">
        {list.length !== 0 &&
        <thead>
          <tr>
            <th>Name</th>
            <th>Nickname</th>
            <th>Release?</th>
          </tr>
        </thead>}
        <tbody>
        {list.map(pokemon => (
          <tr key={pokemon.id}>
            <td>{pokemon.pokemonName}</td>
            <td>{pokemon.nickname}</td>
            <td>
              <button id={pokemon.id} onClick={() => this.removePokemon(pokemon.nickname, pokemon.id)} 
                      type="button" 
                      className="btn btn-danger">
                      Release Pokemon
              </button>
            </td>
          </tr>
        ))}
        </tbody>
      </table>
    </div>
    )
  }

  render() {
    const { error, isLoaded, items } = this.state;
    if (error) {
      return <div>Error: {error.message}</div>;
    } else if (!isLoaded) {
      return <div>Loading...</div>;
    } else {
      return (
        <div>
          <Router>
            <Navbar sticky="top" bg="dark" expand="lg" variant="dark">
              <Container>
              <Navbar.Brand href="/my-pokemon"><img src={logo} width="30" height="30" alt="logo"/> My Pok&eacute;mon API</Navbar.Brand>
              <Navbar.Toggle aria-controls="basic-navbar-nav" />
              <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="mr-auto">
                  <Link className="nav-link" onClick={() => this.hideCatchButton()} to={"/my-pokemon"}>Pok&eacute;mon List</Link>
                  <Link className="nav-link" onClick={() => this.hideCatchButton()} to={"/my-pokemon/MyPokemonList"}>My Pok&eacute;mon List</Link>
                </Nav>
              </Navbar.Collapse>
              </Container>
            </Navbar>
            <div className="container">
              <div className="row">
                <div className="col-md-4 pokemonList">
                <h1>Pok&eacute;mon Master List</h1>
                <ul>
                  {items.results.map(item => (
                    <li key={item.url}>
                      <Link onClick={() => this.setCurrentPokemon(item.name)} to={"/my-pokemon/PokemonDetails/" + item.name}>{item.name}</Link>
                    </li>
                  ))}
                </ul>
                <h3>Owned a total of: {this.state.collectedPokemon.length} pok&eacute;mons</h3>
                </div>
                <Route exact path="/my-pokemon" render={() => <div className="col-md-8 text-center"><h1>Welcome</h1></div>} />
                {this.state.detailClicked === true &&
                <div className="col-md-8 text-center">
                  <div className="row">
                  <Route path="/my-pokemon/PokemonDetails/:name" component={PokemonDetails} />
                  <div className="col-md-4 col-sm-6">
                  <button className="btn btnPrimary btnCatch" onClick={() => this.catchPokemon(this.state.pokemon)}><img width="100%" src={logo} alt="catchButton"></img></button>
                  </div>
                  </div>
                </div>}
                <Route path="/my-pokemon/MyPokemonList" render={() => this.renderPokemonList(this.state.collectedPokemon)} />
              </div>
            </div>
          </Router>
        </div>
      );
    }
  }
}

class PokemonDetails extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      isLoaded: false,
      items: {},
      url: "https://pokeapi.co/api/v2/",
      pokemon: ""
    };
  }

  // Initial load
  componentDidMount() {
    const { match } = this.props;
    this.setState({pokemon: match.params.name});
    fetch(this.state.url + "pokemon/" + match.params.name)
      .then(res => res.json())
      .then(
        (result) => {
          this.setState({
            isLoaded: true,
            items: result
          });
        },
        // Note: it's important to handle errors here
        // instead of a catch() block so that we don't swallow
        // exceptions from actual bugs in components.
        (error) => {
          this.setState({
            isLoaded: true,
            error
          });
        }
      )
  }

  // Fetch data whenever another pokemon from the list is clicked
  componentDidUpdate(prevProps) {
    const { match } = this.props;
    if(this.props.match !== prevProps.match){
    this.setState({pokemon: match.params.name});
    fetch(this.state.url + "pokemon/" + match.params.name)
      .then(res => res.json())
      .then(
        (result) => {
          this.setState({
            isLoaded: true,
            items: result
          });
        },
        // Note: it's important to handle errors here
        // instead of a catch() block so that we don't swallow
        // exceptions from actual bugs in components.
        (error) => {
          this.setState({
            isLoaded: true,
            error
          });
        }
      )
    }
  }

  render() {
    const { error, isLoaded, items } = this.state;
    if (error) {
      return <div>Error: {error.message}</div>;
    } else if (!isLoaded) {
      return <div>Loading...</div>;
    } else {
      return (
        <div className="col-md-8 col-sm-6">
          <div className="pokemonDetail">
            <h2>Pok&eacute;mon Details for {this.state.pokemon}</h2>
            <img src={items.sprites.front_default} alt="sprite" className="pokemonSprite"></img>
            <h3>Name: {items.species.name.substring(0,1).toUpperCase() + items.species.name.substring(1)}</h3>
            <div className="pokemonTypeList">
              <h3>Types: </h3>
              <ul>
                {items.types.map(type => (
                  <li key={type.type.url}>{type.type.name}</li>
                ))}
              </ul>
            </div>
            <div className="pokemonMoveList">
              <h3>Moves: </h3>
              <ul>
                {items.moves.map(move => (
                  <li key={move.move.url}>{move.move.name}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      );
    }
  }  
}

export default App;