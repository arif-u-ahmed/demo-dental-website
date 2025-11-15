
      // Professional AIChatWidget - No template switching
      window.AIChatWidget = {
        _contactIdentifier: null,
        _widgetConversationThreadId: null,
        _customerNumberCounter: null,
        _isInitialized: false,

        getContactIdentifier: function() {
          if (!this._contactIdentifier) {
            const localStorageKey = 'aiChatWidgetUserIdentifier_' + "69180bc9fad4b4bbaf6ccb1e";
            let storedId = null;
            try {
              storedId = localStorage.getItem(localStorageKey);
            } catch (e) { console.warn('AIChatWidget: localStorage not accessible.'); }
            
            if (storedId) {
              this._contactIdentifier = storedId;
            } else {
              const generateUUID = () => {
                return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                  var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                  return v.toString(16);
                });
              };
              this._contactIdentifier = generateUUID();
              try {
                localStorage.setItem(localStorageKey, this._contactIdentifier);
              } catch (e) { console.warn('AIChatWidget: localStorage not accessible for saving new ID.'); }
            }
          }
          return this._contactIdentifier;
        },

        setWidgetConversationThreadId: function(threadId) {
          this._widgetConversationThreadId = threadId;
        },

        getWidgetConversationThreadId: function() {
          return this._widgetConversationThreadId;
        },

        // LocalStorage conversation management
        generateUUID: function() {
          return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
          });
        },

        getNextCustomerNumber: function() {
          const key = 'aiChatWidget_' + "69180bc9fad4b4bbaf6ccb1e" + '_customerCounter';
          try {
            let counter = parseInt(localStorage.getItem(key) || '0');
            counter++;
            localStorage.setItem(key, counter.toString());
            return counter;
          } catch (e) {
            console.warn('AIChatWidget: Could not access customer counter');
            return Date.now(); // Fallback to timestamp
          }
        },

        // Thread management
        saveThread: function(thread) {
          try {
            const threadsKey = 'aiChatWidget_' + "69180bc9fad4b4bbaf6ccb1e" + '_threads';
            const threadKey = 'aiChatWidget_' + "69180bc9fad4b4bbaf6ccb1e" + '_thread_' + thread.threadId;
            
            // Get existing threads list
            let threads = JSON.parse(localStorage.getItem(threadsKey) || '[]');
            
            // Update or add thread
            const existingIndex = threads.findIndex(t => t.threadId === thread.threadId);
            if (existingIndex >= 0) {
              threads[existingIndex] = thread;
            } else {
              threads.push(thread);
            }
            
            // Save updated list and thread details
            localStorage.setItem(threadsKey, JSON.stringify(threads));
            localStorage.setItem(threadKey, JSON.stringify(thread));
            
            return true;
          } catch (e) {
            console.error('AIChatWidget: Failed to save thread', e);
            return false;
          }
        },

        getThread: function(threadId) {
          try {
            const threadKey = 'aiChatWidget_' + "69180bc9fad4b4bbaf6ccb1e" + '_thread_' + threadId;
            const thread = localStorage.getItem(threadKey);
            return thread ? JSON.parse(thread) : null;
          } catch (e) {
            console.error('AIChatWidget: Failed to get thread', e);
            return null;
          }
        },

        listThreads: function(contactIdentifier) {
          try {
            const threadsKey = 'aiChatWidget_' + "69180bc9fad4b4bbaf6ccb1e" + '_threads';
            const threads = JSON.parse(localStorage.getItem(threadsKey) || '[]');
            
            // Filter by contact identifier if provided
            if (contactIdentifier) {
              return threads.filter(t => t.contactIdentifier === contactIdentifier && t.status !== 'archived');
            }
            
            return threads;
          } catch (e) {
            console.error('AIChatWidget: Failed to list threads', e);
            return [];
          }
        },

        // Message management
        saveMessage: function(message) {
          try {
            const messagesKey = 'aiChatWidget_' + "69180bc9fad4b4bbaf6ccb1e" + '_messages_' + message.threadId;
            let messages = JSON.parse(localStorage.getItem(messagesKey) || '[]');
            
            // Add message
            messages.push(message);
            
            // Save messages
            localStorage.setItem(messagesKey, JSON.stringify(messages));
            
            // Update thread metadata
            const thread = this.getThread(message.threadId);
            if (thread) {
              thread.lastMessageTimestamp = message.timestamp;
              thread.lastMessageSnippet = message.content.substring(0, 200);
              thread.totalMessages = messages.length;
              this.saveThread(thread);
            }
            
            return true;
          } catch (e) {
            console.error('AIChatWidget: Failed to save message', e);
            return false;
          }
        },

        getMessages: function(threadId) {
          try {
            const messagesKey = 'aiChatWidget_' + "69180bc9fad4b4bbaf6ccb1e" + '_messages_' + threadId;
            const messages = localStorage.getItem(messagesKey);
            return messages ? JSON.parse(messages) : [];
          } catch (e) {
            console.error('AIChatWidget: Failed to get messages', e);
            return [];
          }
        },

        // Create or get thread for conversation
        getOrCreateThread: function(contactIdentifier) {
          try {
            // Check for existing active thread
            const threads = this.listThreads(contactIdentifier);
            let activeThread = threads.find(t => t.status === 'active');
            
            if (!activeThread) {
              // Create new thread
              activeThread = {
                threadId: this.generateUUID(),
                contactIdentifier: contactIdentifier,
                customerNumber: this.getNextCustomerNumber(),
                firstMessageTimestamp: new Date().toISOString(),
                lastMessageTimestamp: new Date().toISOString(),
                lastMessageSnippet: '',
                totalMessages: 0,
                status: 'active'
              };
              this.saveThread(activeThread);
            }
            
            return activeThread;
          } catch (e) {
            console.error('AIChatWidget: Failed to get or create thread', e);
            return null;
          }
        },

        init: function(config) {
          // Professional widget always uses professional template - no settings fetch needed
          const professionalSettings = {"theme":"light","themeColor":"#2563eb","showFirstMessage":true,"firstMessage":"Welcome to our dental practice! How can we assist you today?","logoUrl":"https://i.imgur.com/aUwP0og.png","logoWidth":60,"logoCropPosition":{"x":50,"y":50},"logoScale":1,"widgetLogoCropPosition":{"x":50,"y":50},"widgetLogoScale":0.75,"avatarLogoUrl":"https://i.imgur.com/aUwP0og.png","widgetLogoUrl":"https://i.imgur.com/aUwP0og.png","avatarLogoCropPosition":{"x":50,"y":45},"avatarLogoScale":1.15,"useLogoForAvatar":true,"useLogoForMinimizedWidget":true,"dailyLimit":200,"widgetTitle":"Dental Assistant","width":400,"height":700,"responsive":true,"minimizedSize":"medium","minimizedSizePixels":70,"placement":"bottom-right","inputPlaceholder":"Ask us anything...","chatBubble":{"enabled":true,"message":"Hello! Need help scheduling an appointment?","delaySeconds":2}};
          
          // Allow config overrides for backward compatibility
          const finalSettings = { ...professionalSettings, ...config };
          finalSettings.widgetId = config?.widgetId || "69180bc9fad4b4bbaf6ccb1e";
          
          // Ensure baseUrl is set correctly based on environment
          if (!finalSettings.baseUrl) {
            // Use the fallback URL calculated server-side
            finalSettings.baseUrl = "https://buildmyagent.io";
          }
          
          this.initProfessionalWidget(finalSettings);
        },
        
        initProfessionalWidget: function(settings) {
          console.log('[AIChatWidget] Initializing professional widget');
          
          // Check if widget is already initialized
          if (this._isInitialized) {
            console.log('[AIChatWidget] Widget already initialized (flag check), skipping duplicate initialization');
            return;
          }
          
          const existingContainer = document.getElementById('ai-chat-widget-container');
          if (existingContainer && existingContainer.querySelector('.ai-chat-widget')) {
            console.log('[AIChatWidget] Widget already initialized (DOM check), skipping duplicate initialization');
            this._isInitialized = true;
            return;
          }
          
          // Ensure contactIdentifier is initialized
          this.getContactIdentifier();

          const widgetId = settings.widgetId;
          if (!widgetId) { console.error('Widget ID is required'); return; }

          // Add Manrope font
          if (!document.querySelector('link[href*="family=Manrope"]')) {
            const preconnect = document.createElement('link');
            preconnect.rel = 'preconnect';
            preconnect.href = 'https://fonts.googleapis.com';
            document.head.appendChild(preconnect);

            const preconnect2 = document.createElement('link');
            preconnect2.rel = 'preconnect';
            preconnect2.href = 'https://fonts.gstatic.com';
            preconnect2.crossOrigin = 'anonymous';
            document.head.appendChild(preconnect2);

            const fontLink = document.createElement('link');
            fontLink.href = 'https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600&display=swap';
            fontLink.rel = 'stylesheet';
            document.head.appendChild(fontLink);
          }
          
          // Add base styles
          if (!document.getElementById('ai-chat-widget-professional-styles')) {
             const styleSheet = document.createElement('style');
             styleSheet.id = 'ai-chat-widget-professional-styles';
             styleSheet.textContent = '.ai-chat-widget, .ai-chat-widget * { font-family: "Manrope", sans-serif !important; box-sizing: border-box; }';
             document.head.appendChild(styleSheet);
             
             // Removed mobile-specific CSS - let widget control its own sizing
          }

          const placement = settings.placement || 'bottom-right';
          const isMobile = window.innerWidth <= 768;
          const buttonSize = isMobile ? 56 : (settings.minimizedSizePixels || 64);
          
          // Calculate placement styles dynamically based on device
          const getPlacementStyles = function(placement, isMobile) {
            // Use explicit offsets instead of margin to avoid host CSS interference
            const offset = isMobile ? '12px' : '20px';
            const base = { position: 'fixed' };
            switch(placement) {
              case 'bottom-right':
                return Object.assign({}, base, { bottom: offset, right: offset, transformOrigin: 'bottom right' });
              case 'bottom-left':
                return Object.assign({}, base, { bottom: offset, left: offset, transformOrigin: 'bottom left' });
              case 'top-right':
                return Object.assign({}, base, { top: offset, right: offset, transformOrigin: 'top right' });
              case 'top-left':
                return Object.assign({}, base, { top: offset, left: offset, transformOrigin: 'top left' });
              default:
                return Object.assign({}, base, { bottom: offset, right: offset, transformOrigin: 'bottom right' });
            }
          };
          
          const placementStyles = getPlacementStyles(placement, isMobile);
          
          // Create container
          let container = document.getElementById('ai-chat-widget-container');
          if (!container) {
            container = document.createElement('div');
            container.id = 'ai-chat-widget-container';
            document.body.appendChild(container);
          } else {
            console.warn('[Widget] Container already exists - reusing it');
            // Clear any existing content to prevent duplicates
            container.innerHTML = '';
          }

          // Calculate sizes for different states
          const buttonPadding = 20; // padding for hover effects
          const initialButtonSize = buttonSize + buttonPadding;
          
          // Container only needs to hold the button/widget
          // Chat bubble will be rendered separately in parent DOM
          let containerWidth = initialButtonSize;
          let containerHeight = initialButtonSize;
          
          Object.assign(container.style, {
            ...placementStyles,
            position: 'fixed',
            width: containerWidth + 'px',
            height: containerHeight + 'px',
            padding: '0',
            zIndex: '9999',
            transition: 'width 0.3s ease, height 0.3s ease',
            background: 'transparent',
            overflow: 'visible', // Ensure overflow is visible
            pointerEvents: 'auto', // Allow clicks on button
            boxSizing: 'border-box',
            margin: '0'
            // Removed 'contain' property as it can affect positioning of children
          });
          
          // Set initial state as minimized
          container.setAttribute('data-widget-state', 'minimized');

          // Apply initial positioning based on current viewport
          setTimeout(() => {
            if (typeof applyCorrectPositioning === 'function') {
              applyCorrectPositioning();
            }
          }, 100);

          // Belt-and-suspenders: force anchoring against host CSS overrides
          try {
            container.style.setProperty('position', 'fixed', 'important');
            container.style.setProperty('transform', 'none', 'important');
            if (placementStyles.bottom) container.style.setProperty('bottom', placementStyles.bottom, 'important');
            if (placementStyles.top) container.style.setProperty('top', placementStyles.top, 'important');
            if (placementStyles.right) container.style.setProperty('right', placementStyles.right, 'important');
            if (placementStyles.left) container.style.setProperty('left', placementStyles.left, 'important');
            container.style.setProperty('z-index', '9999', 'important');
          } catch (e) { /* ignore */ }
          
          // REMOVED setTimeout - legacy widget doesn't use delayed transitions
          
          // Create iframe container
          const iframeContainer = document.createElement('div');
          iframeContainer.className = 'ai-chat-widget';
          // Iframe container fills the parent container. Default to circular clip for minimized state.
          iframeContainer.style.cssText = 'width: 100%; height: 100%; border-radius: 50%; overflow: hidden; transition: opacity 0.3s ease; transform-origin: ' + placementStyles.transformOrigin + '; background-color: transparent; position: relative; will-change: transform, opacity; pointer-events: auto; z-index: 1;';
          try {
            if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
              iframeContainer.style.transition = 'none';
            }
          } catch (e) { /* ignore */ }
          
          // Create iframe - Always load professional template
          const iframe = document.createElement('iframe');
          iframe.setAttribute('allowtransparency', 'true');
          iframe.setAttribute('frameborder', '0');
          iframe.setAttribute('scrolling', 'no');
          Object.assign(iframe.style, {
            width: '100%',
            height: '100%',
            border: 'none',
            borderRadius: '16px',
            background: 'transparent',
            backgroundColor: 'transparent',
            colorScheme: 'normal',
            pointerEvents: 'auto',
            visibility: 'visible',
            position: 'absolute',
            top: '0',
            left: '0'
          });
          
          // Professional iframe URL - no template ambiguity
          const iframeSrc = settings.baseUrl + '/widget/' + widgetId + '?theme=' + settings.theme + '&themeColor=' + encodeURIComponent(settings.themeColor) + '&template=professional';
          console.log('[AIChatWidget] Loading professional iframe from:', iframeSrc);
          
          iframe.onerror = function() {
            console.error('[AIChatWidget] Failed to load professional widget iframe');
          };
          
          iframe.onload = function() {
            console.log('[AIChatWidget] Professional widget iframe loaded successfully');
          };
          
          iframe.src = iframeSrc;
          iframeContainer.appendChild(iframe);
          
          // Add debouncing for resize events to prevent rapid updates
          let resizeDebounceTimer = null;
          let isResizing = false; // Flag to prevent resize feedback loops
          let resizeHandlerActive = false; // Flag to prevent postMessage interference

          // Store last known viewport state
          let lastKnownMobileState = window.innerWidth <= 1024;

          // Function to properly reset and apply positioning
          const applyCorrectPositioning = (forceMobileState = null) => {
            const widgetState = container.getAttribute('data-widget-state');
            const isMobileView = forceMobileState !== null ? forceMobileState : window.innerWidth <= 1024;
            const placementStyles = getPlacementStyles(placement, isMobileView);

            // Always clear ALL positioning first to avoid conflicts
            container.style.position = 'fixed';
            container.style.top = '';
            container.style.bottom = '';
            container.style.left = '';
            container.style.right = '';
            container.style.transform = 'none';
            container.style.margin = '0';

            // Apply fresh positioning
            if (placementStyles.bottom) container.style.bottom = placementStyles.bottom;
            if (placementStyles.top) container.style.top = placementStyles.top;
            if (placementStyles.left) container.style.left = placementStyles.left;
            if (placementStyles.right) container.style.right = placementStyles.right;
            container.style.transformOrigin = placementStyles.transformOrigin;
            container.style.zIndex = '9999';

            return isMobileView;
          };

          // Create chat bubble element in parent DOM
          let chatBubble = null;
          
          function createChatBubble(message) {
            if (chatBubble) return; // Already exists
            
            chatBubble = document.createElement('div');
            chatBubble.id = 'ai-chat-bubble-external';
            
            // Use fixed positioning based on widget placement settings
            // This ensures consistent positioning regardless of widget state
            const isMobile = window.innerWidth <= 768; // Mobile detection
            const buttonSize = 60; // Standard button size
            const bubbleGap = 15; // Reduced gap to bring bubble closer to button
            const bubbleWidth = isMobile ? 240 : 260; // Responsive width
            const bubbleHeight = 80; // Approximate height
            // Industry standard: bubble should be prominently visible above button
            // Keep consistent position regardless of whether widget was previously opened
            const bubbleBottom = isMobile ? 80 : 94; // Mobile: 80px, Desktop: 94px from bottom
            const bubbleSide = 20; // Fixed side margin
            
            // No longer needed - keeping consistent position
            // Removed the data-bubble-shown-before attribute logic
            
            // Calculate fixed button position based on placement
            // This should match where the widget button appears when minimized
            const viewport = {
              width: window.innerWidth,
              height: window.innerHeight
            };
            
            // Determine bubble position based on placement setting
            let buttonPosition = {
              bottom: bubbleBottom, // Fixed bubble position
              right: bubbleSide,
              top: null,
              left: null
            };
            
            if (placement.includes('top')) {
              buttonPosition.top = bubbleBottom; // Use consistent positioning
              buttonPosition.bottom = null;
            }
            if (placement.includes('left')) {
              buttonPosition.left = bubbleSide;
              buttonPosition.right = null;
            }
            
            // Base styles - ensure bubble is completely independent
            const styles = {
              position: 'fixed',
              padding: isMobile ? '14px 16px' : '16px 20px', // More generous padding
              background: settings.theme === 'dark' ? '#1f2937' : '#ffffff',
              color: settings.theme === 'dark' ? '#f9fafb' : '#111827',
              borderRadius: '20px', // More rounded for modern look
              boxShadow: '0 8px 30px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)', // Softer, layered shadow
              maxWidth: bubbleWidth + 'px',
              minWidth: isMobile ? '200px' : '220px', // Slightly larger
              cursor: 'pointer',
              animation: 'fadeIn 0.3s ease',
              fontWeight: '400', // Lighter weight for cleaner look
              fontSize: isMobile ? '14px' : '15px',
              lineHeight: '1.5',
              zIndex: '999999',
              fontFamily: '"Manrope", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              overflow: 'visible',
              display: 'block',
              boxSizing: 'border-box',
              border: '1px solid ' + (settings.theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)') // Subtle border
            };
            
            // Determine bubble position based on widget placement
            // Use fixed positions to ensure consistency
            let bubblePosition = 'above-left'; // default
            
            // Position bubble relative to where the widget button SHOULD be (not where container currently is)
            // Position bubble at optimal height
            if (placement.includes('bottom-right')) {
              // Widget button is fixed at bottom-right
              // Position bubble at fixed location
              styles.bottom = buttonPosition.bottom + 'px'; // Fixed position
              styles.right = (buttonPosition.right - 20) + 'px'; // Move more to the right
              bubblePosition = 'above-left';
            } else if (placement.includes('bottom-left')) {
              // Widget button is fixed at bottom-left
              styles.bottom = buttonPosition.bottom + 'px'; // Fixed position
              styles.left = (buttonPosition.left + 10) + 'px';
              bubblePosition = 'above-right';
            } else if (placement.includes('top-right')) {
              // Widget button is fixed at top-right
              styles.top = (buttonPosition.top + buttonSize + 15) + 'px'; // Lowered by 25px
              styles.right = (buttonPosition.right + 10) + 'px';
              bubblePosition = 'below-left';
            } else if (placement.includes('top-left')) {
              // Widget button is fixed at top-left
              styles.top = (buttonPosition.top + buttonSize + 15) + 'px'; // Lowered by 25px
              styles.left = (buttonPosition.left + 10) + 'px';
              bubblePosition = 'below-right';
            } else {
              // Default to bottom-right placement
              styles.bottom = buttonPosition.bottom + 'px';
              styles.right = (buttonPosition.right - 20) + 'px';
              bubblePosition = 'above-left';
            }
            
            // Ensure bubble stays within viewport bounds
            // Check after adding to DOM and adjust if needed
            
            // Apply styles
            Object.assign(chatBubble.style, styles);
            
            // Add content with close button
            // Arrow positioning based on actual bubble position
            let arrowStyles = 'position: absolute; width: 16px; height: 16px; background: inherit; transform: rotate(45deg); z-index: -1; box-shadow: 2px 2px 4px rgba(0,0,0,0.05); ';
            
            // Position arrow based on bubble position relative to button
            switch(bubblePosition) {
              case 'above-left':
              case 'above-center':
                // Arrow points down-right towards button (since bubble is offset left)
                arrowStyles += 'bottom: -8px; right: 32px;';
                break;
              case 'above-right':
                // Arrow points down-left towards button
                arrowStyles += 'bottom: -8px; left: 32px;';
                break;
              case 'below-left':
                // Arrow points up-right towards button
                arrowStyles += 'top: -8px; right: 32px;';
                break;
              case 'below-right':
                // Arrow points up-left towards button
                arrowStyles += 'top: -8px; left: 32px;';
                break;
              default:
                // Default: arrow points down-right
                arrowStyles += 'bottom: -8px; right: 32px;';
            }
            
            // SECURITY: Escape HTML to prevent XSS
            const escapeHTML = function(str) {
              const div = document.createElement('div');
              div.textContent = str;
              return div.innerHTML;
            };
            
            chatBubble.innerHTML = '<div style="position: relative; padding-right: 28px;">' +
              escapeHTML(message) +
              '<button id="bubble-close-btn" style="position: absolute; top: -2px; right: -2px; width: 20px; height: 20px; padding: 0; display: flex; align-items: center; justify-content: center; cursor: pointer; background: transparent; border: none; color: ' + (settings.theme === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)') + '; opacity: 0.6; transition: opacity 0.2s, color 0.2s; border-radius: 50%;" onmouseover="this.style.opacity=\'1\'; this.style.color=\'' + (settings.theme === 'dark' ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.7)') + '\';" onmouseout="this.style.opacity=\'0.6\'; this.style.color=\'' + (settings.theme === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)') + '\';">' +
              '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">' +
              '<line x1="18" y1="6" x2="6" y2="18"></line>' +
              '<line x1="6" y1="6" x2="18" y2="18"></line>' +
              '</svg>' +
              '</button>' +
              '</div>' +
              '<div style="' + arrowStyles + '"></div>';
            
            // Add event listeners
            chatBubble.onclick = function(e) {
              if (e.target.closest('#bubble-close-btn')) {
                removeChatBubble();
              } else {
                // Open widget when bubble is clicked
                iframe.contentWindow.postMessage({ type: 'open-widget' }, '*');
                removeChatBubble();
              }
            };
            
            // Append directly to body to ensure it's at the top level
            // This ensures it's not affected by any parent element constraints
            document.body.appendChild(chatBubble);
            
            // Force reflow to ensure styles are applied
            chatBubble.offsetHeight;
            
            // Double-check that bubble is visible and not constrained
            const bubbleRect = chatBubble.getBoundingClientRect();
            if (bubbleRect.width === 0 || bubbleRect.height === 0) {
              console.warn('[AIChatWidget] Bubble may be hidden or constrained');
            }
            
            // Adjust position if bubble goes outside viewport
            setTimeout(() => {
              if (chatBubble) {
                const rect = chatBubble.getBoundingClientRect();
                let adjusted = false;
                
                // Check if bubble is outside viewport and adjust
                if (rect.right > viewport.width) {
                  chatBubble.style.right = '10px';
                  chatBubble.style.left = 'auto';
                  adjusted = true;
                }
                if (rect.left < 0) {
                  chatBubble.style.left = '10px';
                  chatBubble.style.right = 'auto';
                  adjusted = true;
                }
                if (rect.top < 0) {
                  chatBubble.style.top = '10px';
                  chatBubble.style.bottom = 'auto';
                  adjusted = true;
                }
                if (rect.bottom > viewport.height) {
                  chatBubble.style.bottom = '10px';
                  chatBubble.style.top = 'auto';
                  adjusted = true;
                }
                
                // Debug logging
                console.log('[AIChatWidget] Chat bubble positioned:', {
                  bubblePosition: bubblePosition,
                  buttonPosition: buttonPosition,
                  bubbleRect: rect,
                  adjusted: adjusted,
                  placement: placement,
                  finalPosition: {
                    bottom: chatBubble.style.bottom,
                    right: chatBubble.style.right,
                    top: chatBubble.style.top,
                    left: chatBubble.style.left
                  }
                });
              }
            }, 10);
          }
          
          function removeChatBubble() {
            if (chatBubble) {
              chatBubble.style.opacity = '0';
              setTimeout(() => {
                if (chatBubble && chatBubble.parentNode) {
                  chatBubble.parentNode.removeChild(chatBubble);
                }
                chatBubble = null;
              }, 300);
            }
          }
          
          // Message listeners
          window.addEventListener('message', (event) => {
            // Handle bubble messages from iframe
            if (event.data && event.source === iframe.contentWindow) {
              if (event.data.type === 'show-bubble') {
                if (settings.chatBubble?.enabled && container.getAttribute('data-widget-state') === 'minimized') {
                  createChatBubble(event.data.message || settings.chatBubble.message || 'Hi there! Need any help?');
                }
              } else if (event.data.type === 'hide-bubble') {
                removeChatBubble();
              } else if (event.data.type === 'widget-opened') {
                removeChatBubble();
              } else if (event.data.type === 'widget-closed') {
                // Widget was closed, show bubble again after a delay if configured
                if (settings.chatBubble?.enabled) {
                  setTimeout(() => {
                    if (container.getAttribute('data-widget-state') === 'minimized') {
                      createChatBubble(settings.chatBubble.message || 'Hi there! Need any help?');
                    }
                  }, (settings.chatBubble?.delaySeconds || 2) * 1000); // Use configured delay in seconds
                }
              }
            }
            
            // Handle resize messages from iframe
            if (event.data && event.data.type === 'resize-widget' && event.source === iframe.contentWindow) {

              console.log('[Widget Message: resize-widget]', {
                isOpen: event.data.isOpen,
                width: event.data.width,
                height: event.data.height,
                isMinimized: event.data.isMinimized,
                windowWidth: window.innerWidth,
                containerBefore: {
                  top: container.style.top,
                  bottom: container.style.bottom,
                  left: container.style.left,
                  right: container.style.right,
                  width: container.style.width,
                  height: container.style.height
                }
              });

              // Prevent resize loops - if we're already processing a resize, skip
              if (isResizing || resizeHandlerActive) {
                console.log('[Widget] Skipping resize - already processing');
                return;
              }

              // Clear any pending resize
              if (resizeDebounceTimer) {
                clearTimeout(resizeDebounceTimer);
              }

              // Debounce resize handling to prevent glitching
              resizeDebounceTimer = setTimeout(() => {
                isResizing = true; // Set flag to prevent loops
              // Check if mobile and open for full-screen
              // Update pointer-events based on widget state
              container.style.pointerEvents = 'auto';

              // Parent determines mobile state based on actual browser window
              const isMobileView = window.innerWidth <= 1024;
              const shouldGoFullscreen = event.data.isOpen && settings.responsive !== false && isMobileView;

              console.log('[Widget] Processing resize:', {
                isMobileView,
                shouldGoFullscreen,
                currentFullscreen: container.getAttribute('data-fullscreen')
              });
              
              
              // Set widget state based on isOpen (applies to both mobile and desktop)
              if (!event.data.isOpen) {
                container.setAttribute('data-widget-state', 'minimized');
              } else {
                container.setAttribute('data-widget-state', 'open');
              }

              if (shouldGoFullscreen) {
                // Industry standard: Full screen on mobile devices and tablets under 1024px
                // Most chat widgets (Intercom, Zendesk, Crisp) go edge-to-edge on mobile

                // Clear any existing styles to avoid conflicts
                container.style.cssText = '';

                // Set position and edges to ensure full coverage
                container.style.position = 'fixed';
                container.style.top = '0px';
                container.style.left = '0px';
                container.style.right = '0px';
                container.style.bottom = '0px';

                // Use 100% width and height when edges are set
                // This ensures the element stretches to fill the entire viewport
                container.style.width = '100%';
                container.style.height = '100%';

                // Remove any constraints that might prevent full coverage
                container.style.maxWidth = 'none';
                container.style.maxHeight = 'none';
                container.style.minWidth = '0';
                container.style.minHeight = '0';

                // Ensure no padding, margin, or border affects sizing
                container.style.margin = '0';
                container.style.padding = '0';
                container.style.border = 'none';
                container.style.boxSizing = 'border-box';

                // Other necessary styles
                container.style.zIndex = '9999';
                container.style.transform = 'none';
                container.style.transformOrigin = 'center';
                container.style.borderRadius = '0';
                container.style.overflow = 'hidden';

                // Track fullscreen state explicitly to avoid brittle style checks
                container.setAttribute('data-fullscreen', '1');

                iframeContainer.style.width = '100%';
                iframeContainer.style.height = '100%';
                iframeContainer.style.borderRadius = '0';
                iframeContainer.style.transform = 'none';
                iframe.style.borderRadius = '0';

                document.body.style.overflow = 'hidden';
                document.documentElement.style.overflow = 'hidden';
              } else {
                // Use exact dimensions for desktop or minimized state
                const vw = window.innerWidth || document.documentElement.clientWidth;
                const vh = window.innerHeight || document.documentElement.clientHeight;
                
                const maxWidgetWidth = 900;
                const requestedWidth = event.data.width;
                const viewportConstrainedWidth = Math.round(vw * 0.96);
                
                const targetW = (settings.responsive !== false) 
                  ? Math.min(requestedWidth, viewportConstrainedWidth, maxWidgetWidth) 
                  : Math.min(requestedWidth, maxWidgetWidth);
                  
                const targetH = (settings.responsive !== false) 
                  ? Math.min(event.data.height, Math.round(vh * 0.96)) 
                  : event.data.height;
                
                // Only update dimensions if they actually changed to prevent unnecessary reflows
                if (container.style.width !== targetW + 'px' || container.style.height !== targetH + 'px') {
                  container.style.width = targetW + 'px';
                  container.style.height = targetH + 'px';
                  iframeContainer.style.width = targetW + 'px';
                  iframeContainer.style.height = targetH + 'px';
                }
                
                // Compute placement styles once per handler run  
                // isMobileView already defined above
                const placementStylesForView = getPlacementStyles(placement, isMobileView);
                // If we were previously in fullscreen, clear edge pins and re-apply placement
                if (container.getAttribute('data-fullscreen') === '1') {
                  container.style.top = '';
                  container.style.left = '';
                  container.style.right = '';
                  container.style.bottom = '';
                  
                  // Apply positioning explicitly instead of Object.assign
                  if (placementStylesForView.bottom) container.style.bottom = placementStylesForView.bottom;
                  if (placementStylesForView.top) container.style.top = placementStylesForView.top;
                  if (placementStylesForView.left) container.style.left = placementStylesForView.left;
                  if (placementStylesForView.right) container.style.right = placementStylesForView.right;
                  if (placementStylesForView.position) container.style.position = placementStylesForView.position;
                  
                  container.removeAttribute('data-fullscreen');
                  
                } else {
                  // Use the centralized positioning function for consistency
                  applyCorrectPositioning(isMobileView);
                }
                // Keep container pinned to its anchor before revealing child
                container.style.position = 'fixed';
                container.style.maxWidth = 'none';
                container.style.maxHeight = 'none';
                container.style.padding = '0';
                container.style.zIndex = '9999';
                container.style.transform = 'none';
                container.style.transformOrigin = placementStylesForView.transformOrigin;
                
                iframeContainer.style.borderRadius = '16px';
                iframeContainer.style.overflow = 'visible';
                iframe.style.borderRadius = '16px';
                // Let the child fade/scale from the anchor, not move vertically
                iframeContainer.style.transform = 'scale(1)';
                
                if (!event.data.isOpen) {
                  console.log('[Widget] Setting to MINIMIZED state');
                  document.body.style.overflow = '';
                  document.documentElement.style.overflow = '';

                  // Use centralized positioning function
                  console.log('[Widget] Applying positioning for minimized state');
                  applyCorrectPositioning(isMobileView);

                  // Calculate button size based on viewport
                  const buttonSize = isMobileView ? 56 : 64;
                  const hoverPadding = Math.ceil(buttonSize * 0.1 / 2);
                  const minimizedSize = buttonSize + (hoverPadding * 2);
                  container.style.width = minimizedSize + 'px';
                  container.style.height = minimizedSize + 'px';
                  container.style.padding = hoverPadding + 'px';
                  iframeContainer.style.width = buttonSize + 'px';
                  iframeContainer.style.height = buttonSize + 'px';
                  container.style.borderRadius = '0';
                  iframeContainer.style.borderRadius = '50%';
                  iframeContainer.style.overflow = 'hidden';
                  iframe.style.borderRadius = '50%';

                  console.log('[Widget] Minimized state applied:', {
                    top: container.style.top,
                    bottom: container.style.bottom,
                    left: container.style.left,
                    right: container.style.right,
                    width: container.style.width,
                    height: container.style.height
                  });

                  container.style.pointerEvents = 'auto';
                } else {
                  // Widget is open, remove bubble
                  removeChatBubble();
                  container.style.pointerEvents = 'auto';
                  iframeContainer.style.borderRadius = '16px';
                  iframeContainer.style.overflow = 'visible';
                  iframe.style.borderRadius = '16px';
                }
              }
              
              // Reset flag after a short delay to allow next resize
              setTimeout(() => {
                isResizing = false;
              }, 100);
              }, 50); // 50ms debounce for resize events
            }
            
            if (event.data && event.data.type === 'AIChatWidgetInternal') {
              if (event.data.action === 'getIdentifiers' && event.source === iframe.contentWindow) {
                event.source.postMessage({
                  type: 'AIChatWidgetInternalResponse',
                  action: 'identifiers',
                  contactIdentifier: this.getContactIdentifier(),
                  widgetConversationThreadId: this.getWidgetConversationThreadId()
                }, '*');
              }
              if (event.data.action === 'setWidgetConversationThreadId' && event.data.threadId) {
                this.setWidgetConversationThreadId(event.data.threadId);
              }
              
              // Handle localStorage operations
              if (event.source === iframe.contentWindow) {
                switch(event.data.action) {
                  case 'getOrCreateThread':
                    const thread = this.getOrCreateThread(event.data.contactIdentifier);
                    event.source.postMessage({
                      type: 'AIChatWidgetInternalResponse',
                      action: 'threadCreated',
                      thread: thread
                    }, '*');
                    if (thread) {
                      this.setWidgetConversationThreadId(thread.threadId);
                    }
                    break;
                    
                  case 'saveMessage':
                    const messageSaved = this.saveMessage(event.data.message);
                    event.source.postMessage({
                      type: 'AIChatWidgetInternalResponse',
                      action: 'messageSaved',
                      success: messageSaved
                    }, '*');
                    break;
                    
                  case 'getMessages':
                    const messages = this.getMessages(event.data.threadId);
                    event.source.postMessage({
                      type: 'AIChatWidgetInternalResponse',
                      action: 'messages',
                      messages: messages
                    }, '*');
                    break;
                    
                  case 'listThreads':
                    const threads = this.listThreads(event.data.contactIdentifier);
                    event.source.postMessage({
                      type: 'AIChatWidgetInternalResponse',
                      action: 'threads',
                      threads: threads
                    }, '*');
                    break;
                }
              }
            }
          });

          // Initialize DOM - only append iframe container
          container.appendChild(iframeContainer);
          
          // Add styles for bubble animation and ensure it's not constrained
          if (!document.getElementById('ai-chat-bubble-styles')) {
            const bubbleStyles = document.createElement('style');
            bubbleStyles.id = 'ai-chat-bubble-styles';
            bubbleStyles.textContent = '@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } } ' +
              '#ai-chat-bubble-external { transition: opacity 0.3s ease; position: fixed !important; z-index: 999999 !important; } ' +
              // Ensure body doesn't have overflow hidden that might affect fixed positioning
              'body.ai-widget-active { overflow: visible !important; }';
            document.head.appendChild(bubbleStyles);
            
            // Add class to body when widget is active
            document.body.classList.add('ai-widget-active');
          }
          
          // Send initial configuration to iframe
          iframe.onload = function() {
            // Tell iframe about bubble configuration
            iframe.contentWindow.postMessage({
              type: 'bubble-config',
              enabled: settings.chatBubble?.enabled || false,
              message: settings.chatBubble?.message || 'Hi there! Need any help?',
              delay: settings.chatBubble?.delaySeconds || 2
            }, '*');
          };
          
          // Function to ensure correct positioning based on current state
          const ensureCorrectPosition = () => {
            // Make sure we're looking at the right container
            const currentContainer = document.getElementById('ai-chat-widget-container');
            if (!currentContainer) {
              console.error('[Widget] Container not found!');
              return;
            }

            // Check if we have multiple containers (bug!)
            const allContainers = document.querySelectorAll('#ai-chat-widget-container');
            if (allContainers.length > 1) {
              console.error('[Widget] MULTIPLE CONTAINERS DETECTED!', allContainers.length);
              // Fix by removing duplicates
              for (let i = 1; i < allContainers.length; i++) {
                allContainers[i].remove();
              }
              return; // Exit to avoid confusion
            }

            const widgetState = currentContainer.getAttribute('data-widget-state');
            const currentIsMobile = window.innerWidth <= 1024;
            const isFullscreen = currentContainer.getAttribute('data-fullscreen') === '1';

            // Only log when state changes or position is wrong
            const currentPos = {
              top: currentContainer.style.top,
              bottom: currentContainer.style.bottom,
              left: currentContainer.style.left,
              right: currentContainer.style.right
            };

            // Check if position looks wrong
            const positionLooksWrong = (
              (currentPos.top === '0px' && currentPos.left === '0px' && placement === 'bottom-right' && widgetState !== 'open') ||
              (!currentPos.bottom && !currentPos.right && placement === 'bottom-right')
            );

            if (positionLooksWrong) {
              console.log('[Widget WRONG POSITION]', {
                widgetState,
                currentIsMobile,
                isFullscreen,
                currentPosition: currentPos,
                placement: placement,
                containerId: container.id,
                containerClass: container.className
              });
            }

            // For minimized state, always ensure correct positioning
            if (widgetState === 'minimized' || !widgetState) {
              const placementStyles = getPlacementStyles(placement, currentIsMobile);

              // Check if position needs correction
              const needsCorrection = (
                !container.style.bottom && !container.style.top ||
                container.style.left === '0px' && placement.includes('right') ||
                container.style.right === '0px' && placement.includes('left') ||
                container.style.top === '0px' && placement.includes('bottom')
              );

              if (needsCorrection) {
                console.log('[Widget] NEEDS CORRECTION! Fixing position...', {
                  reason: {
                    noPosition: !container.style.bottom && !container.style.top,
                    wrongLeft: container.style.left === '0px' && placement.includes('right'),
                    wrongRight: container.style.right === '0px' && placement.includes('left'),
                    wrongTop: container.style.top === '0px' && placement.includes('bottom')
                  },
                  willApply: placementStyles
                });

                // Reset and apply correct positioning
                container.style.position = 'fixed';
                container.style.top = '';
                container.style.bottom = '';
                container.style.left = '';
                container.style.right = '';
                container.style.transform = 'none';
                container.style.margin = '0';

                if (placementStyles.bottom) container.style.bottom = placementStyles.bottom;
                if (placementStyles.top) container.style.top = placementStyles.top;
                if (placementStyles.left) container.style.left = placementStyles.left;
                if (placementStyles.right) container.style.right = placementStyles.right;
                container.style.transformOrigin = placementStyles.transformOrigin;
                container.style.zIndex = '9999';

                console.log('[Widget] Position corrected to:', {
                  top: container.style.top,
                  bottom: container.style.bottom,
                  left: container.style.left,
                  right: container.style.right
                });
              }
            }
            // For open state in desktop, ensure not stuck in fullscreen positioning
            else if (widgetState === 'open' && !currentIsMobile && isFullscreen) {
              console.log('[Widget] OPEN STATE: Need to exit fullscreen mode in desktop view');
              // Need to exit fullscreen mode
              const vw = window.innerWidth || document.documentElement.clientWidth;
              const vh = window.innerHeight || document.documentElement.clientHeight;
              const targetW = settings.responsive ? Math.min(settings.width || 400, Math.round(vw * 0.96)) : (settings.width || 400);
              const targetH = settings.responsive ? Math.min(settings.height || 700, Math.round(vh * 0.96)) : (settings.height || 700);

              // Apply desktop positioning
              applyCorrectPositioning(false);

              container.style.width = targetW + 'px';
              container.style.height = targetH + 'px';
              iframeContainer.style.width = targetW + 'px';
              iframeContainer.style.height = targetH + 'px';
              container.style.borderRadius = '16px';
              container.removeAttribute('data-fullscreen');
              iframeContainer.style.borderRadius = '16px';
              iframeContainer.style.overflow = 'visible';
              iframe.style.borderRadius = '16px';

              document.body.style.overflow = '';
              document.documentElement.style.overflow = '';
            }
          };

          // Store interval ID so we can clear it on destroy
          const positionCheckInterval = setInterval(ensureCorrectPosition, 500);

          // Store it on the container for cleanup
          container.positionCheckInterval = positionCheckInterval;

          // Listen to window resize for responsive updates
          if (settings.responsive !== false) {
            const resizeHandler = () => {
              const widgetState = container.getAttribute('data-widget-state');
              const isMobileView = window.innerWidth <= 1024;

              // Check if viewport type actually changed
              const viewportChanged = isMobileView !== lastKnownMobileState;

              console.log('[Widget Resize Handler]', {
                widgetState,
                isMobileView,
                lastKnownMobileState,
                viewportChanged,
                windowWidth: window.innerWidth,
                currentPosition: {
                  top: container.style.top,
                  bottom: container.style.bottom,
                  left: container.style.left,
                  right: container.style.right
                }
              });

              // Set flag to prevent postMessage interference
              resizeHandlerActive = true;
              setTimeout(() => {
                resizeHandlerActive = false;
              }, 200);

              if (widgetState === 'open') {
                const currentFullscreen = container.getAttribute('data-fullscreen') === '1';

                // Also check if we have fullscreen styles even without the attribute
                const hasFullscreenStyles = (
                  container.style.top === '0px' &&
                  container.style.left === '0px' &&
                  container.style.right === '0px' &&
                  container.style.bottom === '0px' &&
                  (container.style.width === '100vw' || container.style.width === '100%')
                );

                if (isMobileView && !currentFullscreen && !hasFullscreenStyles) {
                  console.log('[Widget] Switching to FULLSCREEN mode');

                  // Clear any existing styles to avoid conflicts
                  container.style.cssText = '';

                  // Set position and edges to ensure full coverage
                  container.style.position = 'fixed';
                  container.style.top = '0px';
                  container.style.left = '0px';
                  container.style.right = '0px';
                  container.style.bottom = '0px';

                  // Use 100% width and height when edges are set
                  container.style.width = '100%';
                  container.style.height = '100%';

                  // Remove any constraints that might prevent full coverage
                  container.style.maxWidth = 'none';
                  container.style.maxHeight = 'none';
                  container.style.minWidth = '0';
                  container.style.minHeight = '0';

                  // Ensure no padding, margin, or border affects sizing
                  container.style.margin = '0';
                  container.style.padding = '0';
                  container.style.border = 'none';
                  container.style.boxSizing = 'border-box';

                  // Other necessary styles
                  container.style.zIndex = '9999';
                  container.style.transform = 'none';
                  container.style.transformOrigin = 'center';
                  container.style.borderRadius = '0';
                  container.style.overflow = 'hidden';

                  container.setAttribute('data-fullscreen', '1');

                  iframeContainer.style.width = '100%';
                  iframeContainer.style.height = '100%';
                  iframeContainer.style.borderRadius = '0';
                  iframe.style.borderRadius = '0';

                  document.body.style.overflow = 'hidden';
                  document.documentElement.style.overflow = 'hidden';
                } else if (!isMobileView && (currentFullscreen || hasFullscreenStyles)) {
                  console.log('[Widget] Exiting FULLSCREEN mode to desktop view');

                  // CRITICAL: Remove fullscreen attribute FIRST before any style changes
                  container.removeAttribute('data-fullscreen');

                  // Switching from mobile fullscreen to desktop
                  const vw = window.innerWidth || document.documentElement.clientWidth;
                  const vh = window.innerHeight || document.documentElement.clientHeight;

                  const targetW = settings.responsive ? Math.min(settings.width || 400, Math.round(vw * 0.96)) : (settings.width || 400);
                  const targetH = settings.responsive ? Math.min(settings.height || 700, Math.round(vh * 0.96)) : (settings.height || 700);

                  // Clear ALL positioning styles completely
                  container.style.cssText = '';

                  // Re-apply base styles
                  container.style.position = 'fixed';
                  container.style.zIndex = '9999';
                  container.style.margin = '0';
                  container.style.padding = '0';

                  // Get and apply desktop placement styles
                  const desktopPlacement = getPlacementStyles(settings.placement || 'bottom-right', false);

                  // Apply positioning based on placement
                  if (settings.placement === 'bottom-right' || !settings.placement) {
                    container.style.bottom = '20px';
                    container.style.right = '20px';
                  } else if (settings.placement === 'bottom-left') {
                    container.style.bottom = '20px';
                    container.style.left = '20px';
                  } else if (settings.placement === 'top-right') {
                    container.style.top = '20px';
                    container.style.right = '20px';
                  } else if (settings.placement === 'top-left') {
                    container.style.top = '20px';
                    container.style.left = '20px';
                  }

                  container.style.transformOrigin = desktopPlacement.transformOrigin;

                  // Apply size
                  container.style.width = targetW + 'px';
                  container.style.height = targetH + 'px';
                  container.style.borderRadius = '16px';

                  iframeContainer.style.width = targetW + 'px';
                  iframeContainer.style.height = targetH + 'px';
                  iframeContainer.style.borderRadius = '16px';
                  iframeContainer.style.overflow = 'visible';
                  iframe.style.borderRadius = '16px';

                  document.body.style.overflow = '';
                  document.documentElement.style.overflow = '';

                  // Force the browser to apply the styles immediately
                  void container.offsetHeight;

                  console.log('[Widget] Desktop positioning applied:', {
                    placement: settings.placement || 'bottom-right',
                    top: container.style.top,
                    bottom: container.style.bottom,
                    left: container.style.left,
                    right: container.style.right,
                    width: container.style.width,
                    height: container.style.height
                  });

                  // Verify the positioning actually stuck
                  setTimeout(() => {
                    console.log('[Widget] Position after 100ms:', {
                      top: container.style.top,
                      bottom: container.style.bottom,
                      left: container.style.left,
                      right: container.style.right
                    });
                  }, 100);

                  // Notify iframe about viewport change
                  iframe.contentWindow.postMessage({ type: 'viewport-changed', isMobile: false }, '*');

                  // IMPORTANT: Return early to prevent any other positioning code from running
                  return;
                }
              } else if (widgetState === 'minimized' || !widgetState) {
                // Widget is minimized - always apply correct positioning on viewport change
                if (viewportChanged) {
                  applyCorrectPositioning(isMobileView);

                  // Update button size based on viewport
                  const buttonSize = isMobileView ? 56 : (settings.minimizedSizePixels || 64);
                  const hoverPadding = Math.ceil(buttonSize * 0.1 / 2);
                  const minimizedSize = buttonSize + (hoverPadding * 2);

                  container.style.width = minimizedSize + 'px';
                  container.style.height = minimizedSize + 'px';
                  container.style.padding = hoverPadding + 'px';
                  container.style.borderRadius = '0';

                  iframeContainer.style.width = buttonSize + 'px';
                  iframeContainer.style.height = buttonSize + 'px';
                  iframeContainer.style.borderRadius = '50%';
                  iframeContainer.style.overflow = 'hidden';
                  iframe.style.borderRadius = '50%';
                }
              }

              // Update last known state
              lastKnownMobileState = isMobileView;
            };
            
            window.addEventListener('resize', resizeHandler);
            
            // Store handler for cleanup
            this._resizeHandler = resizeHandler;
          }
          
          // Mark as initialized
          this._isInitialized = true;
          
          console.log('[AIChatWidget] Professional widget initialized successfully');
        },

        destroy: function() {
          console.log('[AIChatWidget] Destroying professional widget...');
          
          // Remove resize handler
          if (this._resizeHandler) {
            window.removeEventListener('resize', this._resizeHandler);
            this._resizeHandler = null;
          }
          
          // Remove chat bubble if it exists
          const chatBubble = document.getElementById('ai-chat-bubble-external');
          if (chatBubble && chatBubble.parentNode) {
            chatBubble.parentNode.removeChild(chatBubble);
          }
          
          // Remove widget container
          const container = document.getElementById('ai-chat-widget-container');
          if (container) {
            // Clear the position check interval
            if (container.positionCheckInterval) {
              clearInterval(container.positionCheckInterval);
            }
            if (container.parentNode) {
              container.parentNode.removeChild(container);
            }
          }
          
          // Clean up event listeners
          if (window.messageEventListener) {
            window.removeEventListener('message', window.messageEventListener);
            window.messageEventListener = null;
          }
          
          // Reset initialization flag
          this._isInitialized = false;
          this._widgetConversationThreadId = null;
          
          console.log('[AIChatWidget] Professional widget destroyed successfully');
        }
      };

      // Auto-initialize professional widget
      (function() {
        var scripts = document.getElementsByTagName('script');
        var widgetId = null;
        
        for (var i = 0; i < scripts.length; i++) {
          var src = scripts[i].src || '';
          var match = src.match(/\/widget\/([^\/]+)\/widget-professional\.js/);
          if (match) {
            widgetId = match[1];
            break;
          }
        }
        
        if (widgetId) {
          console.log('[AIChatWidget] Auto-initializing professional widget with ID:', widgetId);
          if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
              window.AIChatWidget.init({ widgetId: widgetId });
            });
          } else {
            window.AIChatWidget.init({ widgetId: widgetId });
          }
        } else {
          console.warn('[AIChatWidget] Could not auto-initialize professional widget: unable to extract widgetId');
        }
      })();
    