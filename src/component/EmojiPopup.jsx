import React, { useState, useEffect, useRef } from 'react';
import { X, Search } from 'lucide-react';
import './EmojiPopup.css';

const EmojiPopup = ({ isOpen, position, showSidebar, onClose, onSelect }) => {
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('');
  const [emojis, setEmojis] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [filteredEmojis, setFilteredEmojis] = useState([]);
  const popupRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      if (isOpen && popupRef.current) {
        const optimalPosition = calculateOptimalPosition(position, { width: 320, height: 350 });
        popupRef.current.style.top = `${optimalPosition.top}px`;
        popupRef.current.style.left = `${optimalPosition.left}px`;
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen, position]);

  // Fetch emoji categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(
          'https://emoji-api.com/categories?access_key=7a007b3034c725cebcd6809ba76afc8351fa3c8f'
        );
        const data = await response.json();
        setCategories(data);
        
        if (data.length > 0) {
          setActiveCategory(data[0].slug);
        }
      } catch (error) {
        console.error('Error fetching emoji categories:', error);
      }
    };
    
    fetchCategories();
  }, []);

  // Fetch emojis for active category
  useEffect(() => {
    const fetchEmojis = async () => {
      if (!activeCategory) return;
      
      setLoading(true);
      try {
        const response = await fetch(
          `https://emoji-api.com/categories/${activeCategory}?access_key=7a007b3034c725cebcd6809ba76afc8351fa3c8f`
        );
        const data = await response.json();

        setEmojis(data);
        setFilteredEmojis(data);
      } catch (error) {
        console.error(`Error fetching emojis for ${activeCategory}:`, error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEmojis();
  }, [activeCategory]);

  // Filter emojis based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredEmojis(emojis);
    } else {
      const filtered = emojis.filter(emoji => 
        emoji.unicodeName.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredEmojis(filtered);
    }
  }, [searchTerm, emojis]);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const calculateOptimalPosition = (triggerPos, popupSize) => {
    const viewportHeight = window.innerHeight;
    
    // Get the chat container
    const chatContainer = document.querySelector('.chat-container');
    const chatContainerRect = chatContainer?.getBoundingClientRect() || {
      left: 0,
      right: window.innerWidth,
      width: window.innerWidth
    };
    
    // Tính toán vị trí top như cũ (vẫn hoạt động tốt)
    let top = triggerPos.top - popupSize.height;
    
    // Kiểm tra nếu popup sẽ vượt quá đỉnh màn hình
    if (top < 10) {
      top = triggerPos.top + 30; // Hiển thị dưới nút thay vì trên
    }
    
    // Sử dụng right trực tiếp thay vì tính toán left
    // Khoảng cách 20px từ cạnh phải của chat container
    let right = window.innerWidth - chatContainerRect.right + 20;

    if(showSidebar) {
      right = right - 300;
    }
    
    // Trả về vị trí tối ưu với right thay vì left
    return { top, right };
  };

  const popupSize = { width: 320, height: 350 };
  const optimalPosition = calculateOptimalPosition(position, popupSize);

  // Calculate position - typically above the button
  const popupStyle = {
    top: `${optimalPosition.top}px`,
    right: `${optimalPosition.right}px`,
  };

  return (
    <div className="emoji-popup" style={popupStyle} ref={popupRef}>
      <div className="emoji-header">
        <div className="search-container">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Tìm kiếm emoji..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <button className="close-button" onClick={onClose}>
          <X size={18} />
        </button>
      </div>
      
      <div className="category-tabs">
        {categories.map((category) => (
          <button
            key={category.slug}
            className={`category-tab ${activeCategory === category.slug ? 'active' : ''}`}
            onClick={() => {
              setActiveCategory(category.slug);
              setSearchTerm('');
            }}
            title={category.slug.replace('-', ' ')}
          >
            {getCategoryIcon(category.slug)}
          </button>
        ))}
      </div>
      
      <div className="emoji-content">
        {loading ? (
          <div className="loading">Đang tải...</div>
        ) : filteredEmojis.length === 0 ? (
          <div className="no-results">Không tìm thấy emoji</div>
        ) : (
          <div className="emoji-grid">
            {filteredEmojis.map((emoji) => (
              <button
                key={emoji.slug}
                className="emoji-button"
                onClick={() => {
                  onSelect(emoji.character);
                }}
                title={emoji.unicodeName}
              >
                {emoji.character}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Helper function to get icon for each category
const getCategoryIcon = (slug) => {
  switch (slug) {
    case 'smileys-emotion':
      return '😀';
    case 'people-body':
      return '👨';
    case 'animals-nature':
      return '🐱';
    case 'food-drink':
      return '🍔';
    case 'travel-places':
      return '✈️';
    case 'activities':
      return '⚽';
    case 'objects':
      return '💡';
    case 'symbols':
      return '❤️';
    case 'flags':
      return '🏁';
    default:
      return '📋';
  }
};

export default EmojiPopup;