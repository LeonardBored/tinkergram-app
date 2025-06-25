const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase configuration. Please check your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Tinkergram Backend Server is running',
    timestamp: new Date().toISOString()
  });
});

// GET /api/posts - Get all posts
app.get('/api/posts', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching posts:', error);
      return res.status(400).json({ error: error.message });
    }

    res.json({
      success: true,
      data: data,
      count: data.length
    });
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/posts/:id - Get a specific post by ID
app.get('/api/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching post:', error);
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json({
      success: true,
      data: data
    });
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/posts - Create a new post
app.post('/api/posts', async (req, res) => {
  try {
    const { image, caption } = req.body;

    // Validation
    if (!image || !caption) {
      return res.status(400).json({ 
        error: 'Image and caption are required fields' 
      });
    }

    if (image.length > 2048) {
      return res.status(400).json({ 
        error: 'Image URL must be less than 2048 characters' 
      });
    }

    if (caption.length > 255) {
      return res.status(400).json({ 
        error: 'Caption must be less than 255 characters' 
      });
    }

    const { data, error } = await supabase
      .from('posts')
      .insert([
        { 
          image: image,
          caption: caption
        }
      ])
      .select();

    if (error) {
      console.error('Error creating post:', error);
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: data[0]
    });
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/posts/:id - Update a post
app.put('/api/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { image, caption } = req.body;

    // Validation
    if (!image && !caption) {
      return res.status(400).json({ 
        error: 'At least one field (image or caption) must be provided' 
      });
    }

    const updateData = {};
    if (image) {
      if (image.length > 2048) {
        return res.status(400).json({ 
          error: 'Image URL must be less than 2048 characters' 
        });
      }
      updateData.image = image;
    }
    
    if (caption) {
      if (caption.length > 255) {
        return res.status(400).json({ 
          error: 'Caption must be less than 255 characters' 
        });
      }
      updateData.caption = caption;
    }

    const { data, error } = await supabase
      .from('posts')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) {
      console.error('Error updating post:', error);
      return res.status(400).json({ error: error.message });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json({
      success: true,
      message: 'Post updated successfully',
      data: data[0]
    });
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/posts/:id - Delete a post
app.delete('/api/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id)
      .select();

    if (error) {
      console.error('Error deleting post:', error);
      return res.status(400).json({ error: error.message });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json({
      success: true,
      message: 'Post deleted successfully',
      data: data[0]
    });
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/posts/search - Search posts by caption
app.get('/api/posts/search', async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ 
        error: 'Search query parameter "q" is required' 
      });
    }

    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .ilike('caption', `%${q}%`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error searching posts:', error);
      return res.status(400).json({ error: error.message });
    }

    res.json({
      success: true,
      data: data,
      count: data.length,
      query: q
    });
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Tinkergram Backend Server is running on port ${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
  console.log(`📱 API Base URL: http://localhost:${PORT}/api`);
});

module.exports = app;