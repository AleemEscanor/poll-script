// Function to dynamically load a CSS file
const loadSummaryCSS = (cssUrl) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = cssUrl;
    link.type = 'text/css';
    document.head.appendChild(link);
  };
  
  const loadSummaryGoogleFont = () => {
    const link1 = document.createElement('link');
    link1.rel = "preconnect"
    link1.href="https://fonts.googleapis.com"
    const link2 = document.createElement('link');
    link2.rel = "preconnect"
    link2.href="https://fonts.gstatic.com"
    link2.crossOrigin
  
    const link = document.createElement('link');
    link.rel ='stylesheet';
    link.href = "https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300..800;1,300..800&display=swap";
    document.head.appendChild(link1);
    document.head.appendChild(link2);
    document.head.appendChild(link);
  }
  
  // Load the CSS file
  loadSummaryGoogleFont()
  loadSummaryCSS('https://aleemescanor.github.io/poll-script/summary-style.css'); // Replace with your hosted CSS file URL
  
  window.SummaryNamespace = window.SummaryNamespace || {};
  
  window.SummaryNamespace.GetSummaryBanner = (id, targetSelector) => {
    const fetchApi = async (id) => {
      try {
        const res = await fetch(`https://post-summary.yukta.one/api/summary/${id}`);
        const data = await res.json();
        if (data?.summary) {
          return data.summary;
        } else if (data?.detail) {
          return data.detail;
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        return null;
      }
    };
  
    const fetchAdApi = async (type) => {
      try {
        const res = await fetch(`https://post-summary.yukta.one/api/ad?type=${type}`);
        const data = await res.json();
        if (data?.ad_html) {
          return data.ad_html;
        }
      } catch (error) {
        console.error('Error fetching ad data:', error);
        return null;
      }
    };
  
    const RenderSummaryBanner = async (bannerId, targetSelector = '#my-custom-container') => {
      const summary = await fetchApi(bannerId);
      const adHtml = await fetchAdApi('summary');
  
      const renderSummaryHeading = () => {
        const headingContainer = document.createElement('div')
        headingContainer.classList.add('plugin-heading-text')

        const headingBG = document.createElement('div')
        headingBG.classList.add('pull-heading-bg')  //pull is not a typo, I am trying to match the class names as per the css

        const pluginName = document.createElement('div');
        pluginName.classList.add('pull-plugin-name');

        const titleAnimation = document.createElement('div');
        titleAnimation.classList.add('title-animation');
        const text = document.createElement('h2');
        text.textContent = 'YM Poll';
        pluginName.appendChild(titleAnimation);
        pluginName.appendChild(text);

        const headingContent = document.createElement('div')
        headingContent.classList.add('section-heading')

        const headingText = document.createElement('div')
        headingText.classList.add('pull-section-heading-text')
        headingText.innerHTML = '<h3 class="summary-heading">Gift and Voucher for Premium Customers</h3><div class="sub-heading"><a href="">View T&amp;C</a></div>'

        const headingIcon = document.createElement('div')
        headingIcon.classList.add('section-heading-icon')
        headingIcon.innerHTML = '<img alt="#" data-src="https://raw.githubusercontent.com/shefaligoyal17/poll-script/refs/heads/main/assets/img/Untitled-1.gif" class=" lazyloaded" src="https://raw.githubusercontent.com/shefaligoyal17/poll-script/refs/heads/main/assets/img/Untitled-1.gif">'

        headingContent.appendChild(headingText)
        headingContent.appendChild(headingIcon)

        headingContainer.appendChild(headingBG);
        headingContainer.appendChild(pluginName);
        headingContainer.appendChild(headingContent);

        return headingContainer;
      }
  
      if (summary && adHtml) {
        // The parent container
        const summaryContainer = document.createElement('div');
        summaryContainer.classList.add('summary-container');
  
        // Create the banner container
        const summaryContentWrapper = document.createElement('div');
        summaryContentWrapper.classList.add('summary-content-wrapper');
        summaryContentWrapper.id = `banner-${bannerId}-${targetSelector.replace('#', '')}`;
  
        const pluginData = document.createElement('div');
        pluginData.classList.add('plugin-data');
  
        const summaryContentBlock = document.createElement('div');
        summaryContentBlock.classList.add('summary-content-block');
  
        // For ad
        const AdContent = document.createElement('div');
        AdContent.classList.add('ad-content');
        AdContent.innerHTML = adHtml;
  
        // Radio buttons
        const radioContainer = document.createElement('div');
        radioContainer.classList.add('summary-controls');
  
        const radioName = `summaryType-${bannerId}-${targetSelector.replace('#', '')}`;
  
        const radioLong = document.createElement('input');
        radioLong.type = 'radio';
        radioLong.id = `long-${bannerId}-${targetSelector.replace('#', '')}`;
        radioLong.name = radioName;
  
        const radioMedium = document.createElement('input');
        radioMedium.type = 'radio';
        radioMedium.id = `medium-${bannerId}-${targetSelector.replace('#', '')}`;
        radioMedium.name = radioName;
  
        const radioShort = document.createElement('input');
        radioShort.type = 'radio';
        radioShort.id = `short-${bannerId}-${targetSelector.replace('#', '')}`;
        radioShort.name = radioName;
        radioShort.checked = true;
  
        const labelLong = document.createElement('label');
        labelLong.setAttribute('for', `long-${bannerId}-${targetSelector.replace('#', '')}`);
        labelLong.textContent = 'Long';
        labelLong.appendChild(radioLong);
  
        const labelMedium = document.createElement('label');
        labelMedium.setAttribute('for', `medium-${bannerId}-${targetSelector.replace('#', '')}`);
        labelMedium.textContent = 'Medium';
        labelMedium.appendChild(radioMedium);
  
        const labelShort = document.createElement('label');
        labelShort.setAttribute('for', `short-${bannerId}-${targetSelector.replace('#', '')}`);
        labelShort.textContent = 'Short';
        labelShort.appendChild(radioShort);
  
        radioContainer.appendChild(labelShort);
        radioContainer.appendChild(labelMedium);
        radioContainer.appendChild(labelLong);
  
        const contentDiv = document.createElement('div');
        contentDiv.classList.add('summary-content');
        contentDiv.innerHTML = `<p>${summary.short}</p>`;
  
        summaryContentBlock.appendChild(radioContainer);
        summaryContentBlock.appendChild(contentDiv);
  
        pluginData.appendChild(summaryContentBlock);
        pluginData.appendChild(AdContent);
  
        summaryContentWrapper.appendChild(pluginData);
  
        const headingContainer = renderSummaryHeading();
        summaryContainer.appendChild(headingContainer);
        summaryContainer.appendChild(summaryContentWrapper);
  
        const targetElement = document.querySelector(targetSelector);
        if (targetElement) {
          targetElement.appendChild(summaryContainer);
        } else {
          console.error(`Target element "${targetSelector}" not found. Appending to body instead.`);
          document.body.appendChild(summaryContainer);
        }
  
        radioLong.addEventListener('change', () => {
          contentDiv.innerHTML = `<p>${summary.long}</p>`;
        });
  
        radioMedium.addEventListener('change', () => {
          contentDiv.innerHTML = `<p>${summary.medium}</p>`;
        });
  
        radioShort.addEventListener('change', () => {
          contentDiv.innerHTML = `<p>${summary.short}</p>`;
        });
      } else {
        console.error('No summary or detail available.');
      }
    };
  
    RenderSummaryBanner(id, targetSelector);
  };