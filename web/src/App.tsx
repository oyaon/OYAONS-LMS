import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import PrivateRoute from './components/routing/PrivateRoute'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Dashboard from './pages/Dashboard'
import Books from './pages/books/Books'
import BookDetails from './pages/books/BookDetails'
import Loans from './pages/loans/Loans'
import Profile from './pages/Profile'
import NotFound from './pages/NotFound'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Toaster position="top-right" />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/books" element={<PrivateRoute><Books /></PrivateRoute>} />
            <Route path="/books/:id" element={<PrivateRoute><BookDetails /></PrivateRoute>} />
            <Route path="/loans" element={<PrivateRoute><Loans /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  )
}

export default App 