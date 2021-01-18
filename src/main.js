import React from 'react';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';
import Search from '@material-ui/icons/Search';
import Add from '@material-ui/icons/AddBox';
import Remove from '@material-ui/icons/RemoveCircle';
import Paper from '@material-ui/core/Paper';
import Tooltip from '@material-ui/core/Tooltip';
import Snackbar from '@material-ui/core/Snackbar';
import CloseIcon from '@material-ui/icons/Close';
import './main.css';

class Main extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      searchTerm: '',
      movies: [],
      list: new Map(),
      alert: false
    }

  }

  componentDidMount() {
    try {
      let list = window.localStorage.getItem('list')
      if(list) {
        list = JSON.parse(list)
        this.setState({
          list: new Map(list)
        })
      }
    }
    catch(e) {
      alert('Could not get the existing list!')
    }
  }

  handleSearch = (e) => {
    let term = e.target.value
    this.setState({
      searchTerm: term
    })
    const key = process.env.REACT_APP_OMDB_KEY
    fetch('https://www.omdbapi.com/?' + new URLSearchParams({
      s: term,
      apikey: key
    }))
      .then(res => res.json())
      .then(json => {
        if(json.Response === "True") {
          this.setState({
            movies: json.Search
          })
        } else {
          this.setState({
            movies: []
          })
        }
      });
  }

  nominate = (movie) => {
    let { list } = this.state;
    list.set(movie.imdbID, movie)
    let alert = list.size >= 5 ? true : false
    // Force update of UI
    this.setState({
      list: list,
      alert: alert
    })
    window.localStorage.setItem('list', JSON.stringify(Array.from(list.entries())))
  }

  remove = (movie) => {
    let { list } = this.state;
    list.delete(movie.imdbID)
    // Force update of UI
    this.setState({
      list: list
    })
  }

  handleClose = () => {
    this.setState({
      alert: false
    })
  }

  render() {
    let { searchTerm, movies, list, alert } = this.state;

    let results = movies.map((movie, i) => {
      if(list.has(movie.imdbID)) {
        return <div className="movie">
          <div className="title" imdbid={movie.imdbID}>{movie.Title} ({movie.Year})</div>
            <IconButton disabled='true' color="secondary" onClick={() => this.nominate(movie)} >
              <Add />
            </IconButton>
        </div>;
      } else {
        return <div className="movie">
          <div className="title" imdbid={movie.imdbID}>{movie.Title} ({movie.Year})</div>
          <Tooltip title="Nominate" placement="right">
            <IconButton color="secondary" onClick={() => this.nominate(movie)} >
              <Add />
            </IconButton>
          </Tooltip>
        </div>;
      }
    });

    let listItems = Array.from(list, ([id, movie]) => ({ id, movie }));
    let nominations = listItems.map((item, i) => {
      return <div className="nomination">
        <div className="title" imdbid={item.movie.imdbID}>{item.movie.Title} ({item.movie.Year})</div>
        <Tooltip title="Remove" placement="right">
          <IconButton color="secondary" onClick={() => this.remove(item.movie)} >
            <Remove />
          </IconButton>
        </Tooltip>
      </div>;
    });

    return (
      <div>
        <h1>The Shoppies</h1>
        <div className="body">
          <Paper className="search" elevation={3}>
            <Search />
            <TextField id="search-input" label="Search for a movie" value={searchTerm} onChange={this.handleSearch} autoComplete='off'/>
          </Paper>
          <div className="titles">
            <h2>Results</h2>
            <h2>Nominations</h2>
          </div>
          <div className="info">
            <Paper className="results" elevation={3}>
              {searchTerm && results.length > 0 && results}
            </Paper>
            <Paper className="nominations" elevation={3}>
              {list.size > 0 && nominations}
            </Paper>
          </div>
        </div>
        <Snackbar
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          open={alert}
          autoHideDuration={5000}
          onClose={this.handleClose}
          message="You are finished!"
          action={
            <React.Fragment>
              <IconButton size="small" aria-label="close" color="inherit" onClick={this.handleClose}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </React.Fragment>
          }
        />
      </div>
    );
  }
}

export default Main;
