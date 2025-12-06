
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { authService } from '../../domain/services/authService';

const Navbar = () => {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const [profile, setProfile] = useState(null);

    const isActivePath = (path) => location.pathname === path;

    useEffect(() => {
        const fetchProfile = async () => {
            if (user) {
                try {
                    const data = await authService.getProfile(user.id);
                    setProfile(data);
                } catch (error) {
                    console.error("Failed to fetch profile for navbar", error);
                }
            }
        };
        fetchProfile();
    }, [user]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsUserDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        try {
            await signOut();
            navigate('/login');
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    const calculateAge = (dob) => {
        if (!dob) return '';
        const birthDate = new Date(dob);
        const difference = Date.now() - birthDate.getTime();
        const ageDate = new Date(difference);
        return Math.abs(ageDate.getUTCFullYear() - 1970);
    }

    const menuItems = [
        { name: 'Home', path: '/' },
        { name: 'History', path: '/history' },
    ];

    return (
        <>
            <nav className="bg-white/95 backdrop-blur-sm shadow-sm sticky top-0 z-50 border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16 relative">
                        {/* Logo - Left */}
                        <div className="flex-shrink-0">
                            <Link to="/" className="flex items-center gap-2 group">
                                <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-500 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-200 group-hover:scale-105">
                                    <Icon icon="healthicons:diabetes" className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                                    Glukosa
                                </span>
                            </Link>
                        </div>

                        {/* Menu Items - Center (Desktop) */}
                        <div className="hidden sm:flex items-center absolute left-1/2 transform -translate-x-1/2 gap-1">
                            {menuItems.map((item) => (
                                <Link
                                    key={item.name}
                                    to={item.path}
                                    className="relative px-4 py-2"
                                >
                                    <motion.span
                                        whileHover={{ scale: 1.05 }}
                                        className={`text-sm font-medium transition-colors duration-200 ${isActivePath(item.path)
                                            ? 'text-blue-600'
                                            : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                    >
                                        {item.name}
                                    </motion.span>
                                    {isActivePath(item.path) && (
                                        <motion.div
                                            layoutId="activeMenu"
                                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 to-blue-500"
                                            initial={false}
                                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                        />
                                    )}
                                </Link>
                            ))}
                        </div>

                        {/* User Menu - Right (Desktop) */}
                        <div className="hidden sm:flex sm:items-center">
                            {/* User Dropdown */}
                            <div className="ml-3 relative" ref={dropdownRef}>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                                    className="bg-white rounded-full flex text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 items-center gap-2 px-3 py-2 border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 shadow-sm hover:shadow-md"
                                >
                                    {profile?.img_profile ? (
                                        <img
                                            className="h-7 w-7 rounded-full object-cover ring-2 ring-white"
                                            src={profile.img_profile}
                                            alt=""
                                        />
                                    ) : (
                                        <div className="h-7 w-7 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white ring-2 ring-white">
                                            <Icon icon="heroicons:user" className="w-4 h-4" />
                                        </div>
                                    )}
                                    <div className="hidden md:block text-left mr-1">
                                        <p className="text-sm font-medium text-gray-700 max-w-[100px] truncate">
                                            {profile?.full_name || user?.email}
                                        </p>
                                    </div>
                                    <motion.div
                                        animate={{ rotate: isUserDropdownOpen ? 180 : 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <Icon icon="heroicons:chevron-down" className="w-4 h-4 text-gray-400" />
                                    </motion.div>
                                </motion.button>

                                <AnimatePresence>
                                    {isUserDropdownOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                            transition={{ duration: 0.2, ease: "easeOut" }}
                                            className="origin-top-right absolute right-0 mt-2 w-56 rounded-lg shadow-lg bg-white overflow-hidden z-50"
                                        >
                                            {/* User Info */}
                                            <div className="px-4 py-3 border-b border-gray-100">
                                                <div className="flex items-center gap-2.5">
                                                    {profile?.img_profile ? (
                                                        <img
                                                            className="h-9 w-9 rounded-full object-cover"
                                                            src={profile.img_profile}
                                                            alt=""
                                                        />
                                                    ) : (
                                                        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white">
                                                            <Icon icon="heroicons:user" className="w-5 h-5" />
                                                        </div>
                                                    )}
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-semibold text-gray-900 truncate">{profile?.full_name || 'User'}</p>
                                                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Menu Items */}
                                            <div className="py-1">
                                                <Link
                                                    to="/profile"
                                                    className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                                    onClick={() => setIsUserDropdownOpen(false)}
                                                >
                                                    <Icon icon="heroicons:user-circle" className="w-4 h-4 text-gray-400" />
                                                    <span>My Profile</span>
                                                </Link>
                                                <button
                                                    onClick={handleLogout}
                                                    className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                                >
                                                    <Icon icon="heroicons:arrow-right-on-rectangle" className="w-4 h-4" />
                                                    <span>Sign Out</span>
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        <div className="-mr-2 flex items-center sm:hidden">
                            {/* Mobile menu button */}
                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="bg-white inline-flex items-center justify-center p-2 rounded-lg text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                            >
                                <Icon
                                    icon={isMobileMenuOpen ? "heroicons:x-mark" : "heroicons:bars-3"}
                                    className="block h-6 w-6"
                                />
                            </motion.button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile menu / Drawer - MOVED OUTSIDE of <nav> */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        {/* Overlay - Full screen with backdrop blur */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="sm:hidden fixed inset-0 z-[9998] bg-black/60 backdrop-blur-md"
                            onClick={() => setIsMobileMenuOpen(false)}
                        />

                        {/* Drawer Content */}
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="sm:hidden fixed inset-y-0 left-0 z-[9999] w-80 max-w-[85vw] bg-white shadow-2xl flex flex-col"
                        >
                            {/* Header - Glukosa Logo */}
                            <div className="flex items-center justify-between px-5 py-5 bg-white border-b border-gray-200">
                                <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2">
                                    <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-500 rounded-xl flex items-center justify-center shadow-md">
                                        <Icon icon="healthicons:diabetes" className="w-5 h-5 text-white" />
                                    </div>
                                    <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                                        Glukosa
                                    </span>
                                </Link>
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <Icon icon="heroicons:x-mark" className="h-6 w-6 text-gray-500" />
                                </motion.button>
                            </div>

                            {/* User Info */}
                            <div className="px-5 py-6 bg-gradient-to-br from-blue-600 to-blue-500 text-white shadow-md">
                                <div className="flex items-center gap-4">
                                    {profile?.img_profile ? (
                                        <img className="h-16 w-16 rounded-full object-cover ring-4 ring-white shadow-lg" src={profile.img_profile} alt="" />
                                    ) : (
                                        <div className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center ring-4 ring-white shadow-lg">
                                            <Icon icon="heroicons:user" className="w-8 h-8" />
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <div className="text-lg font-bold truncate">{profile?.full_name || 'User'}</div>
                                        <div className="text-sm text-blue-100 truncate mt-0.5">{user?.email}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Menu List */}
                            <nav className="flex-1 px-4 py-4 bg-white">
                                <div className="space-y-1">
                                    {menuItems.map((item, index) => (
                                        <motion.div
                                            key={item.name}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.08 }}
                                        >
                                            <Link
                                                to={item.path}
                                                onClick={() => setIsMobileMenuOpen(false)}
                                                className="flex items-center gap-3 px-4 py-3.5 text-base font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all duration-200"
                                            >
                                                <Icon icon="heroicons:home" className="w-5 h-5" />
                                                {item.name}
                                            </Link>
                                        </motion.div>
                                    ))}
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: menuItems.length * 0.08 }}
                                    >
                                        <Link
                                            to="/profile"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="flex items-center gap-3 px-4 py-3.5 text-base font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all duration-200"
                                        >
                                            <Icon icon="heroicons:user-circle" className="w-5 h-5" />
                                            My Profile
                                        </Link>
                                    </motion.div>
                                </div>
                            </nav>

                            {/* Footer - Logout */}
                            <div className="px-4 py-4 bg-gray-50 border-t border-gray-200">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleLogout}
                                    className="flex items-center justify-center gap-3 px-4 py-3.5 w-full rounded-xl text-base font-semibold text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-md hover:shadow-lg transition-all duration-200"
                                >
                                    <Icon icon="heroicons:arrow-right-on-rectangle" className="w-5 h-5" />
                                    Sign Out
                                </motion.button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default Navbar;
