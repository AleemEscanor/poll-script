// Function to dynamically load a CSS file
const loadCSS = (cssUrl) => {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = cssUrl;
  link.type = 'text/css';
  document.head.appendChild(link);
};

// Load the CSS file
loadCSS('embed.css'); // Replace with your hosted CSS file URL

window.GetPollBanner = (id, targetSelector = '#my-custom-container') => {
  const fetchApi = async (id) => {
    try {
      const res = await fetch(`https://post-summary.yukta.one/get_poll/${id}`);
      const data = await res.json();
      if (data?.question) {
        return data;
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
  }

  const PostUserResponse = async (pollId, ques, userAnswer) => {
    try {
      if (!pollId || !ques || !userAnswer) {
        return null;
      }
      const res = await fetch(`https://post-summary.yukta.one/submit_poll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ poll_id: pollId, question: ques, user_answer: userAnswer }),
      });
      const data = await res.json();
      if (data?.success) {
        return true
      } else {
        return false
      }
    } catch (error) {
      console.error('Error posting data:', error);
      return null;
    }
  }

  const renderAdContent = async () => {
    const adContainer = document.createElement('div');
    adContainer.classList.add('ad-container');

    const adHtml = await fetchAdApi('poll')
    adContainer.innerHTML = adHtml;
    return adContainer;
  }

  const getPollResults = async (pollId, ques) => {
    try {
      if (!pollId || !ques) {
        return null;
      }
      const res = await fetch(`https://post-summary.yukta.one/get_poll_results`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ poll_id: pollId, question: ques }),
      });
      const data = await res.json();
      if (data?.length > 0) {
        return data
      } else {
        return data?.detail
      }
    } catch (error) {
      console.error('Error posting data:', error);
      return null;
    }
  }

      const renderPollHeading = () => {
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
      headingIcon.innerHTML = '<img alt="#" data-src="assets/img/Untitled-1.gif" class=" lazyloaded" src="assets/img/Untitled-1.gif">'

      headingContent.appendChild(headingText)
      headingContent.appendChild(headingIcon)

      headingContainer.appendChild(headingBG);
      headingContainer.appendChild(pluginName);
      headingContainer.appendChild(headingContent);

      return headingContainer;
    }

  const RenderPollResults = (pollResultArr) => {
    const pollResultContainer = document.createElement('div');
    pollResultContainer.classList.add('poll-results-container');

    const ResultTitle = document.createElement('h3');
    ResultTitle.textContent = 'Poll Results:';

    const pollResultList = document.createElement('ul');

    pollResultArr.forEach(({ answer, percentage}) => {
      const listItem = document.createElement('li');

      const label = document.createElement('div');
      label.classList.add('percentage-label')
      label.innerHTML = `<span>${answer}</span><span class="percentage">${percentage}%</span>`;

      const percentageProgress = document.createElement('div');
      percentageProgress.classList.add('percentage-progress');
      percentageProgress.innerHTML = `<div class="percentage-bar" style="width: ${percentage}%;"></div>`;

      listItem.appendChild(label);
      listItem.appendChild(percentageProgress);

      pollResultList.appendChild(listItem);
    })

    pollResultContainer.appendChild(ResultTitle);
    pollResultContainer.appendChild(pollResultList);

    return pollResultContainer

  }

  const RenderPollBanner = async (bannerId, targetSelector) => {
    const poll = await fetchApi(bannerId);
    let selectedOption;
    if (poll) {
      // Create the banner container
      const pollGameWrapper = document.createElement('div');
      pollGameWrapper.classList.add('poll-game-wrapper');

      const pollWidgetWrapperHeader = document.createElement('div');
      pollWidgetWrapperHeader.classList.add('poll-widget-wrapper-header');

      const pollWidgetWrapperContent = document.createElement('div');
      pollWidgetWrapperContent.classList.add('poll-widget-wrapper-content');
      pollWidgetWrapperContent.id = `data-poll-id-${bannerId}`

      const pollBox = document.createElement('div');
      pollBox.classList.add('poll-box', 'animated', 'fade-in');

      //Question
      const pollQuestion = document.createElement('h3');
      pollQuestion.classList.add('poll-question');
      pollQuestion.textContent = poll.question;

      // Radio Container
      const radioContainer = document.createElement('div');
      const radioName = `pollType-${bannerId}`;

      // Poll Options
      poll.options.forEach((option, index) => {
        //Parent div
        const div = document.createElement('div');
        div.classList.add('poll-option', 'animated', 'fade-in');

        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.id = `option-${index}-${bannerId}`;
        radio.name = radioName;
        radio.value = option;

        radio.addEventListener('change', (event) => {
          selectedOption = event.target.value;
      });

        const label = document.createElement('label');
        label.setAttribute('for', `option-${index}-${bannerId}`);
        label.textContent = option;

        div.appendChild(radio);
        div.appendChild(label);
        radioContainer.appendChild(div);
      })

      const submitBtnContainer = document.createElement('div');
      submitBtnContainer.classList.add('submit-btn-container');

      //submit button for selected option
      const submitButton = document.createElement('button');
      submitButton.classList.add('submit-poll-btn');
      submitButton.textContent = 'Submit';
      submitButton.addEventListener('click', async (event) => {
        event.preventDefault();
        // send selected option to server
        const status = await PostUserResponse(bannerId, poll.question, selectedOption);
        if (status) {
          // alert('Your response has been submitted successfully');
          pollBox.removeChild(radioContainer);
          
          //get poll results
          const pollResults = await getPollResults(bannerId, poll.question);
          const pollResultElement = RenderPollResults(pollResults)
          pollBox.appendChild(pollResultElement)
          console.log('pollresults',pollResults)
        } else {
          console.log('Failed to submit response. Please try again.');
        }
      });

      submitBtnContainer.appendChild(submitButton);
      radioContainer.appendChild(submitBtnContainer);
      
      pollBox.appendChild(pollQuestion);
      pollBox.appendChild(radioContainer);

      const adContent = await renderAdContent()

      pollWidgetWrapperContent.appendChild(pollBox);
      pollWidgetWrapperContent.appendChild(adContent);
      
      pollWidgetWrapperHeader.appendChild(pollWidgetWrapperContent);

      const headingContainer = renderPollHeading()

      pollGameWrapper.appendChild(headingContainer);
      pollGameWrapper.appendChild(pollWidgetWrapperHeader);

      const targetElement = document.querySelector(targetSelector);
      if (targetElement) {
        targetElement.appendChild(pollGameWrapper);
      } else {
        console.error(`Target element "${targetSelector}" not found. Appending to body instead.`);
        document.body.appendChild(pollGameWrapper);
      }
      
    } else {
      console.error('No summary or detail available.');
    }
  };
  
  RenderPollBanner(id, targetSelector);
};
