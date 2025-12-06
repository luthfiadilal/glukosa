
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../../domain/services/authService';
import Input from '../components/Input';
import Button from '../components/Button';
import { Icon } from '@iconify/react';

const Profile = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

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
                setError('Failed to load profile');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [user]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        if (error) setError(null);
        if (success) setSuccess(null);
    };

    const calculateAge = (dob) => {
        if (!dob) return 'N/A';
        const birthDate = new Date(dob);
        const difference = Date.now() - birthDate.getTime();
        const ageDate = new Date(difference);
        return Math.abs(ageDate.getUTCFullYear() - 1970);
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        setSuccess(null);

        try {
            await authService.updateProfile(user.id, {
                full_name: formData.full_name,
                gender: formData.gender,
                no_hp: formData.no_hp,
                tanggal_lahir: formData.tanggal_lahir,
                address: formData.address,
            });
            setSuccess('Profile updated successfully');
            setIsEditing(false);
        } catch (err) {
            console.error(err);
            setError('Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Loading profile...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-8 py-10 text-white flex flex-col md:flex-row items-center gap-6">
                    <div className="h-24 w-24 rounded-full bg-white p-1 shadow-lg flex-shrink-0">
                        {formData.img_profile ? (
                            <img
                                className="h-full w-full rounded-full object-cover"
                                src={formData.img_profile}
                                alt="Profile"
                            />
                        ) : (
                            <div className="h-full w-full rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                <Icon icon="heroicons:user" className="w-12 h-12" />
                            </div>
                        )}
                    </div>
                    <div className="text-center md:text-left">
                        <h1 className="text-2xl font-bold">{formData.full_name || 'User Name'}</h1>
                        <p className="text-blue-100">{user?.email}</p>
                        {formData.tanggal_lahir && (
                            <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-blue-700 bg-opacity-30 text-xs font-medium border border-blue-400 border-opacity-30">
                                {calculateAge(formData.tanggal_lahir)} Years Old
                            </div>
                        )}
                    </div>
                    <div className="flex-1"></div>
                    {!isEditing && (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-all backdrop-blur-sm border border-white border-opacity-20 font-medium"
                        >
                            <Icon icon="heroicons:pencil-square" className="w-5 h-5" />
                            Edit Profile
                        </button>
                    )}
                </div>

                {/* Content */}
                <div className="p-8">
                    {success && (
                        <div className="mb-6 bg-green-50 text-green-600 p-4 rounded-xl border border-green-100 flex items-center gap-2">
                            <Icon icon="heroicons:check-circle" className="w-5 h-5" />
                            {success}
                        </div>
                    )}
                    {error && (
                        <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-center gap-2">
                            <Icon icon="heroicons:exclamation-circle" className="w-5 h-5" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                label="Full Name"
                                name="full_name"
                                value={formData.full_name}
                                onChange={handleChange}
                                required
                                disabled={!isEditing}
                                className={!isEditing ? "opacity-75" : ""}
                            />

                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-gray-700">Email Address</label>
                                <input
                                    type="email"
                                    value={user?.email || ''}
                                    disabled
                                    className="px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                                />
                                <p className="text-xs text-gray-400">Email cannot be changed</p>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-gray-700">Gender</label>
                                <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className={`px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white ${!isEditing ? "bg-gray-50 opacity-75 cursor-default pointer-events-none" : ""}`}
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
                                className={!isEditing ? "opacity-75" : ""}
                            />

                            <Input
                                label="Date of Birth"
                                type="date"
                                name="tanggal_lahir"
                                value={formData.tanggal_lahir}
                                onChange={handleChange}
                                disabled={!isEditing}
                                className={!isEditing ? "opacity-75" : ""}
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium text-gray-700">Address</label>
                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                rows="3"
                                disabled={!isEditing}
                                className={`px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 scrollbar-hide ${!isEditing ? "bg-gray-50 opacity-75 cursor-default" : ""}`}
                            />
                        </div>

                        {isEditing && (
                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => {
                                        setIsEditing(false);
                                        setError(null);
                                        setSuccess(null);
                                        // Reset logic would go here ideally to restore initial values
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={saving}
                                >
                                    {saving ? 'Saving...' : 'Save Changes'}
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
