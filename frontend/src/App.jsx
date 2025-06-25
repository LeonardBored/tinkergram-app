import React, { useState, useEffect } from 'react';
import { Container, Navbar, Nav, Row, Col, Button } from 'react-bootstrap';
import { FaCamera, FaHeart } from 'react-icons/fa';
import PostList from './components/PostList';
import { getPosts } from './services/api';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import NewPost from './views/NewPost';

function HomePage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const response = await getPosts();
      setPosts(response.data.data);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostUpdated = () => {
    loadPosts();
  };

  const handlePostDeleted = () => {
    loadPosts();
  };

  return (
    <>
      {/* Navigation */}
      <Navbar bg="white" expand="lg" className="shadow-sm mb-4" sticky="top">
        <Container>
          <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
            <FaCamera className="me-2" />
            Tinkergram
          </Navbar.Brand>
          <Nav className="ms-auto d-flex align-items-center">
            <Button as={Link} to="/new" variant="primary" className="ms-3">
                New Post
            </Button>
          </Nav>
        </Container>
      </Navbar>

      {/* Main Content */}
      <Container>
        <Row className="justify-content-center">
          <Col lg={8} md={10}>
            {/* Posts List */}
            <PostList 
              posts={posts}
              loading={loading}
              onPostUpdated={handlePostUpdated}
              onPostDeleted={handlePostDeleted}
            />
          </Col>
        </Row>
      </Container>

      {/* Footer */}
      <footer className="bg-white mt-5 py-4 border-top">
        <Container>
          <Row>
            <Col className="text-center">
              <p className="text-muted mb-0">
                <FaHeart className="text-danger me-1" />
                With Passion and Ethics • Tinkergram 2025
              </p>
            </Col>
          </Row>
        </Container>
      </footer>
    </>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/new" element={<NewPost />} />
      </Routes>
    </Router>
  );
}

export default App;
