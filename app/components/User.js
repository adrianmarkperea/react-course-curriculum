import React from 'react'
import queryString from 'query-string'
import { fetchUser, fetchPosts } from '../utils/api'
import Loading from './Loading'
import { formatDate } from '../utils/helpers'
import PostsList from './PostsList'

function userReducer(state, action) {
  if (action.type === 'fetch') {
    return {
      ...state,
      loadingUser: true,
      loadingPosts: true,
    };
  } else if (action.type === 'user') {
    return {
      ...state,
      user: action.user,
      loadingUser: false,
    };
  } else if (action.type === 'posts') {
    return {
      ...state,
      posts: action.posts,
      loadingPosts: false,
      error: null,
    };
  } else if (action.type === 'error') {
    return {
      ...state,
      error: action.message,
      loadingPosts: false,
      loadingUser: false,
    } ;
  } else {
    throw new Error('That action type is not supported');
  }
}

export default function User({ location }) {
  const { id } = queryString.parse(location.search);

  const [state, dispatch] = React.useReducer(
    userReducer,
    { user: null, loadingUser: true, posts: null, loadingPosts: true, error: null}
  );

  React.useEffect(() => {
    dispatch({ type: 'fetch' })

    fetchUser(id)
      .then(user => {
        dispatch({ type: 'user', user });
        return fetchPosts(user.submitted.slice(0, 30));
      })
      .then(posts => dispatch({ type: 'posts', posts }))
      .catch(message => dispatch({ type: 'error', message }));
  }, [id])

  if (state.error) {
    return <p className='center-text error'>{state.error}</p>
  }

  return (
    <React.Fragment>
      {state.loadingUser === true
        ? <Loading text='Fetching User' />
        : <React.Fragment>
            <h1 className='header'>{state.user.id}</h1>
            <div className='meta-info-light'>
              <span>joined <b>{formatDate(state.user.created)}</b></span>
              <span>has <b>{state.user.karma.toLocaleString()}</b> karma</span>
            </div>
            <p dangerouslySetInnerHTML={{__html: state.user.about}} />
          </React.Fragment>}
      {state.loadingPosts === true
        ? state.loadingUser === false && <Loading text='Fetching posts'/>
        : <React.Fragment>
            <h2>Posts</h2>
            <PostsList posts={state.posts} />
          </React.Fragment>}
    </React.Fragment>
  )
}