
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { authService } from '../../domain/services/authService';
import Input from '../components/Input';
import Button from '../components/Button';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';

const Profile = () => {
    const { user } = useAuth();
    const toast = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const [formData, setFormData] = useState({
        full_name: '',
        gender: '',
        no_hp: '',
        tanggal_lahir: '',
        address: '',
        img_profile: '',
    });

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user) return;
            try {
                const data = await authService.getProfile(user.id);
                if (data) {
                    setFormData({
                        full_name: data.full_name || '',
                        gender: data.gender || '',
                        no_hp: data.no_hp || '',
                        tanggal_lahir: data.tanggal_lahir || '',
                        address: data.address || '',
                        img_profile: data.img_profile || '',
                    });
                }
            } catch (err) {
                console.error(err);
                toast.error('Failed to load profile');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [user, toast]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const calculateAge = (dob) => {
        if (!dob) return 'N/A';
        console.log('Birth date:', dob);
        const age = dayjs().diff(dayjs(dob), 'year');
        console.log('Calculated age:', age);
        return age;
    }

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleImageUpload = async () => {
        if (!selectedImage) return;

        setUploadingImage(true);
        try {
            await authService.updateProfileImage(user.id, selectedImage);

            // Refresh profile data
            const data = await authService.getProfile(user.id);
            setFormData({
                ...formData,
                img_profile: data.img_profile || '',
            });

            setSelectedImage(null);
            setImagePreview(null);
            toast.success('Profile photo updated successfully!');
        } catch (err) {
            console.error(err);
            toast.error('Failed to upload photo');
        } finally {
            setUploadingImage(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            await authService.updateProfile(user.id, {
                full_name: formData.full_name,
                gender: formData.gender,
                no_hp: formData.no_hp,
                tanggal_lahir: formData.tanggal_lahir,
                address: formData.address,
            });
            toast.success('Profile updated successfully!');
            setIsEditing(false);
        } catch (err) {
            console.error(err);
            toast.error('Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            {/* Profile Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Header Section */}
                <div className="px-6 py-8 border-b border-gray-100">
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        {/* Avatar with Upload */}
                        <div className="relative group">
                            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 p-1 shadow-md">
                                {imagePreview || formData.img_profile ? (
                                    <img
                                        className="h-full w-full rounded-full object-cover"
                                        src={imagePreview || formData.img_profile}
                                        alt="Profile"
                                    />
                                ) : (
                                    <div className="h-full w-full rounded-full bg-white flex items-center justify-center">
                                        <Icon icon="heroicons:user" className="w-12 h-12 text-blue-600" />
                                    </div>
                                )}
                            </div>

                            {/* Upload Button Overlay */}
                            <label
                                htmlFor="profile-image-upload"
                                className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            >
                                <Icon icon="heroicons:camera" className="w-8 h-8 text-white" />
                            </label>
                            <input
                                id="profile-image-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleImageSelect}
                                className="hidden"
                            />
                        </div>

                        {/* Image Preview Actions */}
                        {selectedImage && (
                            <div className="flex gap-2">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleImageUpload}
                                    disabled={uploadingImage}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                                >
                                    {uploadingImage ? 'Uploading...' : 'Upload Photo'}
                                </motion.button>
                                <button
                                    onClick={() => {
                                        setSelectedImage(null);
                                        setImagePreview(null);
                                    }}
                                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium"
                                >
                                    Cancel
                                </button>
                            </div>
                        )}

                        {/* User Info */}
                        <div className="flex-1 text-center sm:text-left">
                            <h1 className="text-2xl font-bold text-gray-900">{formData.full_name || 'User Name'}</h1>
                            <p className="text-sm text-gray-500 mt-1">{user?.email}</p>
                            {formData.tanggal_lahir && (
                                <div className="mt-3">
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                        {calculateAge(formData.tanggal_lahir)} Years Old
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Edit Button */}
                        {!isEditing && !selectedImage && (
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setIsEditing(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm text-sm font-medium"
                            >
                                <Icon icon="heroicons:pencil-square" className="w-4 h-4" />
                                Edit Profile
                            </motion.button>
                        )}
                    </div>
                </div>

                {/* Form Section */}
                <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Form Fields Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <Input
                                label="Full Name"
                                name="full_name"
                                value={formData.full_name}
                                onChange={handleChange}
                                required
                                disabled={!isEditing}
                            />

                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-gray-700">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    value={user?.email || ''}
                                    disabled
                                    className="px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed text-sm"
                                />
                                <p className="text-xs text-gray-400">Email cannot be changed</p>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-gray-700">
                                    Gender {isEditing && <span className="text-red-500">*</span>}
                                </label>
                                <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    required
                                    className={`px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white ${!isEditing ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''}`}
                                >
                                    <option value="" disabled>Select gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <Input
                                label="Phone Number"
                                name="no_hp"
                                value={formData.no_hp}
                                onChange={handleChange}
                                disabled={!isEditing}
                                placeholder="08123456789"
                            />

                            <Input
                                label="Date of Birth"
                                type="date"
                                name="tanggal_lahir"
                                value={formData.tanggal_lahir}
                                onChange={handleChange}
                                disabled={!isEditing}
                            />
                        </div>

                        {/* Address - Full Width */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium text-gray-700">Address</label>
                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                rows="3"
                                disabled={!isEditing}
                                placeholder="Enter your address"
                                className={`px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none ${!isEditing ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''}`}
                            />
                        </div>

                        {/* Action Buttons */}
                        {isEditing && (
                            <div className="flex justify-end gap-3 pt-5 border-t border-gray-100">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => {
                                        setIsEditing(false);
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={saving}
                                    className="min-w-[120px]"
                                >
                                    {saving ? (
                                        <span className="flex items-center gap-2">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            Saving...
                                        </span>
                                    ) : (
                                        'Save Changes'
                                    )}
                                </Button>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Profile;
