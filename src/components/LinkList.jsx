import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import LinkCard from './LinkCard'
import AdCard from './AdCard'
import { useAuth } from '../contexts/AuthContext'
import {
    FaYoutube,
    FaTwitch,
    FaSnapchat,
    FaWhatsapp,
    FaPlaystation,
    FaInstagram,
    FaTwitter,
    FaTiktok,
    FaLinkedin,
    FaGithub,
    FaDiscord,
    FaSpotify,
    FaGlobe,
    FaLink,
    FaFacebook,
    FaTelegram
} from 'react-icons/fa'
import { FaXTwitter } from 'react-icons/fa6'

/* 
   ICON MAPPER: 
   Maps database strings (e.g., "FaPlaystation", "playstation") to actual React Components.
*/
const getIconComponent = (iconName) => {
    if (!iconName) return <FaLink />;

    // Normalize string to lowercase for easier matching
    const name = iconName.toLowerCase().replace('fa', '');

    switch (name) {
        case 'youtube': return <FaYoutube />;
        case 'twitch': return <FaTwitch />;
        case 'snapchat': case 'snapchat-ghost': return <FaSnapchat />;
        case 'whatsapp': return <FaWhatsapp />;
        case 'playstation': return <FaPlaystation />;
        case 'instagram': return <FaInstagram />;
        case 'twitter': return <FaTwitter />;
        case 'xtwitter': case 'x-twitter': case 'x': return <FaXTwitter />;
        case 'tiktok': return <FaTiktok />;
        case 'linkedin': return <FaLinkedin />;
        case 'github': return <FaGithub />;
        case 'discord': return <FaDiscord />;
        case 'spotify': return <FaSpotify />;
        case 'facebook': return <FaFacebook />;
        case 'telegram': return <FaTelegram />;
        default: return <FaGlobe />;
    }
};

const LinkList = ({ userId, theme }) => {
    const { settings } = useAuth()
    const [links, setLinks] = useState([])
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchLinks = async () => {
            if (!userId) return

            try {
                const { data, error } = await supabase
                    .from('links')
                    .select('*')
                    .eq('user_id', userId)
                    .order('created_at', { ascending: false })

                if (error) {
                    console.error('Supabase Error:', error)
                    setError(error.message)
                } else {
                    setLinks(data || [])
                }
            } catch (err) {
                console.error('Fetch Error:', err)
                setError(err.message)
            }
        }

        fetchLinks()
    }, [userId])

    if (error) return <div className="text-rose-500 font-bold text-center mt-4">Error loading links: {error}</div>

    const profileAds = (settings?.profile_ads || []).filter(ad => !ad.placement || ad.placement === 'profile');

    return (
        <div className="w-full flex flex-col items-center max-w-full mx-auto px-2 sm:px-4">
            {links.map((link, index) => {
                const adsToInject = profileAds.filter(ad => ad.active && ad.inject_index === index);
                return (
                    <React.Fragment key={link.id}>
                        {adsToInject.map(ad => (
                            <AdCard key={ad.id} ad={ad} />
                        ))}
                        <LinkCard
                            id={link.id}
                            title={link.title}
                            url={link.url}
                            icon={getIconComponent(link.icon)}
                            theme={theme}
                        />
                    </React.Fragment>
                );
            })}

            {/* Handle ads injected beyond the current link count */}
            {profileAds
                .filter(ad => ad.active && ad.inject_index >= links.length)
                .map(ad => (
                    <AdCard key={ad.id} ad={ad} />
                ))
            }
        </div>
    )
}

export default LinkList
