
import { supabase } from '../../infrastructure/supabaseClient'

export const authService = {
    async register({ email, password, fullName, gender, noHp, tanggalLahir, address, profileImage }) {
        // 1. Sign up user
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
        })

        if (authError) throw authError

        if (authData.user) {
            let imageUrl = null

            // 2. Upload image if exists
            if (profileImage) {
                const fileExt = profileImage.name.split('.').pop()
                const fileName = `${authData.user.id}.${fileExt}`
                const filePath = `${fileName}`

                const { error: uploadError } = await supabase.storage
                    .from('profile-images')
                    .upload(filePath, profileImage)

                if (uploadError) {
                    console.error('Error uploading image:', uploadError)
                } else {
                    const { data: publicUrlData } = supabase.storage
                        .from('profile-images')
                        .getPublicUrl(filePath)
                    imageUrl = publicUrlData.publicUrl
                }
            }

            // 3. Insert into profiles
            const { error: profileError } = await supabase
                .from('profiles')
                .insert([
                    {
                        id: authData.user.id,
                        full_name: fullName,
                        gender,
                        no_hp: noHp,
                        tanggal_lahir: tanggalLahir,
                        address,
                        img_profile: imageUrl,
                    },
                ])

            if (profileError) {
                throw profileError
            }
        }

        return authData
    },

    async login({ email, password }) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) throw error
        return data
    },

    async logout() {
        const { error } = await supabase.auth.signOut()
        if (error) throw error
    },

    async getUser() {
        const { data } = await supabase.auth.getUser()
        return data.user
    },

    async getProfile(userId) {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single()

        if (error) throw error
        return data
    },

    async updateProfile(userId, updates) {
        const { data, error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', userId)
            .select()

        if (error) throw error
        return data
    },

    async updateProfileImage(userId, imageFile) {
        try {
            // Generate unique file name
            const fileExt = imageFile.name.split('.').pop()
            const fileName = `${userId}-${Date.now()}.${fileExt}`
            const filePath = `${userId}/${fileName}`

            // Upload to Supabase storage
            const { error: uploadError } = await supabase.storage
                .from('profile-images')
                .upload(filePath, imageFile, { upsert: true })

            if (uploadError) throw uploadError

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('profile-images')
                .getPublicUrl(filePath)

            // Update profile with new image URL
            const { data, error } = await supabase
                .from('profiles')
                .update({ img_profile: publicUrl })
                .eq('id', userId)
                .select()

            if (error) throw error
            return data
        } catch (error) {
            throw error
        }
    }
}
