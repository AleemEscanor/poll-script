// const APIURL = "http://127.0.0.1:5005";  // api endpoint
const APIURL = "https://post-summary.yukta.one" // api endpoint
const scriptUrl = "https://aleemescanor.github.io/poll-script"  //url where script is hosted

const assetsUrl = "https://aleemescanor.github.io/poll-script/assets/img"  //where assets such as images are stored


// Function to dynamically load a CSS file
const loadCSS = (cssUrl) => {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = cssUrl;
  link.type = 'text/css';
  document.head.appendChild(link);
};

const loadGoogleFont = () => {
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
loadGoogleFont()
loadCSS(`${scriptUrl}/poll-style.css`); // Replace with your hosted CSS file URL
// loadCSS('poll-style.css'); // Replace with your hosted CSS file URL


window.PollNamespace = window.PollNamespace || {};

  window.PollNamespace.GetPollBanner = (id, targetSelector = '#my-custom-container') => {
    // Check if page is refreshed or navigated (sessionStorage is cleared on page reload or navigation)
    const type = performance.getEntriesByType('navigation')[0].type
    if (type === 'navigate' || type === 'reload' || type === 'back_forward') {
      sessionStorage.clear(); // Clear session storage on page reload
    }

    const getUniqueQues = (pollArr) => {
      let uniqueQues;
      
      //Match the question from session storage questions to get the unique ques
      for (let i = 0; i < pollArr.length; i++) {
        const poll = pollArr[i];
        const isDuplicate = checkDuplicateData(poll.question);

        if (!isDuplicate) {
          uniqueQues = poll;  // Add the poll to the array if it's not a duplicate
          break;  // Stop the loop once the first valid poll is found
        }
      }
      
      return uniqueQues;
    }


    const checkDuplicateData = (ques) => {
      const sessionData = window.sessionStorage.getItem('poll-question')

      if (sessionData) {
        const savedData = JSON.parse(sessionData)
        if (savedData.includes(ques)) {
          return true
        }
        else {
          savedData.push(ques)
          window.sessionStorage.setItem('poll-question', JSON.stringify(savedData))
          return false
        }
      }
      else {
        window.sessionStorage.setItem('poll-question', JSON.stringify([ques]))
        return false
      }
    }

    const fetchApi = async (id) => {
      try {
        const res = await fetch(`${APIURL}/v2/get_poll/${id}`);
        const data = await res.json();
        if (data?.poll?.length > 0) {
          const uniqueQues = getUniqueQues(data?.poll)
          return uniqueQues
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
        const res = await fetch(`${APIURL}/api/ad?type=${type}`);
        const data = await res.json();
        if (data?.ad_html) {
          return data.ad_html;
        }
      } catch (error) {
        console.error('Error fetching ad data:', error);
        return null;
      }
    }

    const setAdAlignment = (align) => {
      if (align === 'left') {
        return "row-reverse"
      }
      else if (align === 'top') {
        return 'column-reverse'
      }
      else if (align === 'bottom') {
        return 'column'
      }
    }

    const PostUserResponse = async (pollId, ques, userAnswer) => {
      try {
        if (!pollId || !ques || !userAnswer) {
          return null;
        }
        const res = await fetch(`${APIURL}/submit_poll`, {
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

    const renderAdContent = async (poll) => {
      const adContainer = document.createElement('div');
      adContainer.classList.add('poll-ad-container');
      adContainer.style.display = poll?.ads_visibilty === "False" ? "none" : "flex"

      const adHtml = await fetchAdApi('poll')
      adContainer.innerHTML = adHtml;
      return adContainer;
    }

    const getPollResults = async (pollId, ques) => {
      try {
        if (!pollId || !ques) {
          return null;
        }
        const res = await fetch(`${APIURL}/get_poll_results`, {
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

        const renderPollHeading = (data) => {
        const headingContainer = document.createElement('div')
        headingContainer.classList.add('poll-plugin-heading-text')

        const headingBG = document.createElement('div')
        headingBG.classList.add('pull-heading-bg')  //pull is not a typo, I am trying to match the class names as per the css

        const pluginName = document.createElement('div');
        pluginName.classList.add('pull-plugin-name');

        const titleAnimation = document.createElement('div');
        titleAnimation.classList.add('poll-title-animation');
        const text = document.createElement('h2');
        text.textContent = data?.badge_text ? data?.badge_text : 'YM Poll';
        pluginName.appendChild(titleAnimation);
        pluginName.appendChild(text);

        const headingContent = document.createElement('div')
        headingContent.classList.add('poll-section-heading')

        const headingText = document.createElement('div')
        headingText.classList.add('pull-section-heading-text')
        headingText.innerHTML = `<h3 class="poll-heading">${data?.header_title || ""}</h3><div class="poll-sub-heading"><a href=${data?.click_through_url_link || ""}>${data?.click_through_url_text || ""}</a></div>`

        const headingIcon = document.createElement('div')
        headingIcon.classList.add('poll-section-heading-icon')
        headingIcon.innerHTML = `<img alt="#" data-src="${assetsUrl}/Untitled-1.gif" class=" lazyloaded" src="${assetsUrl}/Untitled-1.gif">`

        headingContent.appendChild(headingText)
        headingContent.appendChild(headingIcon)

        headingContainer.appendChild(headingBG);
        headingContainer.appendChild(pluginName);
        headingContainer.appendChild(headingContent);

        if (data?.header_visibity === 'True') {
          return headingContainer;
        }
        else {
          pluginName.style.cssText = "top: 18.5px; margin-left: 20px; z-index: 1;"
          return pluginName
        }
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
        pollWidgetWrapperContent.style.flexDirection = setAdAlignment(poll?.ads_alignment)
        pollWidgetWrapperContent.id = `data-poll-id-${bannerId}`

        const pollBox = document.createElement('div');
        pollBox.classList.add('poll-box', 'animated', 'fade-in');

        //Question
        const pollQuestion = document.createElement('h3');
        pollQuestion.classList.add('poll-question');
        pollQuestion.textContent = poll.question;

        // Radio Container
        const radioContainer = document.createElement('div');
        const radioName = `pollType-${bannerId}-${targetSelector}`;

        // Poll Options
        poll.options.forEach((option, index) => {
          //Parent div
          const div = document.createElement('div');
          div.classList.add('poll-option', 'animated', 'fade-in');

          const radio = document.createElement('input');
          radio.type = 'radio';
          radio.id = `option-${index}-${bannerId}-${targetSelector}`;
          radio.name = radioName;
          radio.value = option;

          radio.addEventListener('change', (event) => {
            selectedOption = event.target.value;
        });

          const label = document.createElement('label');
          label.setAttribute('for', `option-${index}-${bannerId}-${targetSelector}`);
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
          } else {
            console.log('Failed to submit response. Please try again.');
          }
        });

        submitBtnContainer.appendChild(submitButton);
        radioContainer.appendChild(submitBtnContainer);
        
        pollBox.appendChild(pollQuestion);
        pollBox.appendChild(radioContainer);

        const adContent = await renderAdContent(poll)

        pollWidgetWrapperContent.appendChild(pollBox);
        pollWidgetWrapperContent.appendChild(adContent);
        
        pollWidgetWrapperHeader.appendChild(pollWidgetWrapperContent);

        const headingContainer = renderPollHeading(poll)

        pollGameWrapper.appendChild(headingContainer);
        pollGameWrapper.appendChild(pollWidgetWrapperHeader);

        const targetElement = document.querySelector(targetSelector);
        if (targetElement) {
          targetElement.appendChild(pollGameWrapper);
        } else {
          console.error(`Target element "${targetSelector}" not found. Appending to body instead.`);
        }
        
      } else {
        console.error('No unique Poll or detail available.');
      }
    };
    
    RenderPollBanner(id, targetSelector);
  };

// Function to dynamically load a CSS file
const loadQuizCSS = (cssUrl) => {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = cssUrl;
  link.type = 'text/css';
  document.head.appendChild(link);
};

const loadQuizGoogleFont = () => {
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
loadQuizGoogleFont()
loadQuizCSS(`${scriptUrl}/quiz-style.css`); // Replace with your hosted CSS file URL
// loadQuizCSS('quiz-style.css'); // Replace with your hosted CSS file URL

window.QuizNamespace = window.QuizNamespace || {};

window.QuizNamespace.GetQuizBanner = (id, targetSelector = '#my-custom-container') => {
  // Check if page is refreshed or navigated (sessionStorage is cleared on page reload or navigation)
  const type = performance.getEntriesByType('navigation')[0].type
  if (type === 'navigate' || type === 'reload' || type === 'back_forward') {
    sessionStorage.clear(); // Clear session storage on page reload
  }

  const getUniqueQues = (quizArr) => {
    let uniqueQues;
    
    //Match the question from session storage questions to get the unique ques
    for (let i = 0; i < quizArr.length; i++) {
      const poll = quizArr[i];
      const isDuplicate = checkDuplicateData(poll.question);

      if (!isDuplicate) {
        uniqueQues = poll;  // Add the poll to the array if it's not a duplicate
        break;  // Stop the loop once the first valid poll is found
      }
    }
    
    return uniqueQues;
  }


  const checkDuplicateData = (ques) => {
    const sessionData = window.sessionStorage.getItem('quiz-question')

    if (sessionData) {
      const savedData = JSON.parse(sessionData)
      if (savedData.includes(ques)) {
        return true
      }
      else {
        savedData.push(ques)
        window.sessionStorage.setItem('quiz-question', JSON.stringify(savedData))
        return false
      }
    }
    else {
      window.sessionStorage.setItem('quiz-question', JSON.stringify([ques]))
      return false
    }
  }

  const fetchApi = async (id) => {
    try {
      const res = await fetch(`${APIURL}/v2/get_quiz/${id}`);
      const data = await res.json();
      if (data?.quiz?.length > 0) {
        const uniqueQues = getUniqueQues(data?.quiz)
        return uniqueQues
      } else if (data?.detail) {
        return data.detail;
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      return null;
    }
  };

  const PostUserResponse = async (quizId, userAnswer) => {
    try {
      if (!quizId || !userAnswer) {
        return null;
      }
      const res = await fetch(`${APIURL}/submit_quiz`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quiz_id: quizId, user_answer: userAnswer }),
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

  const fetchAdApi = async (type) => {
    try {
      const res = await fetch(`${APIURL}/api/ad?type=${type}`);
      const data = await res.json();
      if (data?.ad_html) {
        return data.ad_html;
      }
    } catch (error) {
      console.error('Error fetching ad data:', error);
      return null;
    }
  }

  const renderAdContent = async (quiz) => {
    const adContainer = document.createElement('div');
    adContainer.classList.add('quiz-ad-container');
    adContainer.style.display = quiz?.ads_visibilty === "False" ? "none" : "flex";

    const adHtml = await fetchAdApi('quiz')
    adContainer.innerHTML = adHtml;
    return adContainer;
  }

  const setAdAlignment = (align) => {
    if (align === 'left') {
      return "row-reverse"
    }
    else if (align === 'top') {
      return 'column-reverse'
    }
    else if (align === 'bottom') {
      return 'column'
    }
  }

  const renderQuizHeading = (data) => {
    const headingContainer = document.createElement('div')
    headingContainer.classList.add('quiz-plugin-heading-text')

    const headingBG = document.createElement('div')
    headingBG.classList.add('quiz-heading-bg')  //quiz is not a typo, I am trying to match the class names as per the css

    const pluginName = document.createElement('div');
    pluginName.classList.add('quiz-plugin-name');

    const titleAnimation = document.createElement('div');
    titleAnimation.classList.add('quiz-title-animation');
    const text = document.createElement('h2');
    text.textContent = data?.badge_text ? data?.badge_text : 'YM Quiz';
    pluginName.appendChild(titleAnimation);
    pluginName.appendChild(text);

    const headingContent = document.createElement('div')
    headingContent.classList.add('quiz-section-heading')

    const headingText = document.createElement('div')
    headingText.classList.add('quiz-section-heading-text')
    headingText.innerHTML = `<h3 class="quiz-heading">${data?.header_title || ""}</h3><div class="quiz-sub-heading"><a href=${data?.click_through_url_link || ""}>${data?.click_through_url_text || ""}</a></div>`

    const headingIcon = document.createElement('div')
    headingIcon.classList.add('quiz-section-heading-icon')
    headingIcon.innerHTML = `<img alt="#" data-src="${assetsUrl}/Sun.gif" class=" lazyloaded" src="${assetsUrl}/Sun.gif">`

    headingContent.appendChild(headingText)
    headingContent.appendChild(headingIcon)

    headingContainer.appendChild(headingBG);
    headingContainer.appendChild(pluginName);
    headingContainer.appendChild(headingContent);

    if (data?.header_visibity === 'True') {
      return headingContainer;
    }
    else {
      pluginName.style.cssText = "top: 18.5px; margin-left: 20px; z-index: 1;"
      return pluginName
    }
  }

  const RenderQuizBanner = async (bannerId, targetSelector) => {
    const quiz = await fetchApi(bannerId);
    const TargetId = targetSelector.replace('#', '');
    let selectedOption;

    // Define the event listener function
    const handleOptionClick = (event) => {
      event.preventDefault();
      selectedOption = event.target.value;
      // Change the background color of other options
      const optionContainer = document.querySelector(`#quiz-option-container-${bannerId}-${TargetId}`);
      const otherOptions = optionContainer.querySelectorAll('.quiz-option');
      otherOptions.forEach((otherOption) => {
        otherOption.style.backgroundColor = 'white';
        otherOption.style.borderColor =  'black'
        otherOption.style.color = 'black';
      });
      const div = document.querySelector(`#option-${quiz.options.indexOf(selectedOption)}-${bannerId}-${TargetId}`);
      div.style.backgroundColor = '#e8e8e8';
      div.style.color = 'black';
      div.style.borderColor =  'transparent'
    }

    if (quiz) {
      // Create the banner container
      const quizContainerWidgets = document.createElement('div');
      quizContainerWidgets.classList.add('quiz-container-widgets');
      quizContainerWidgets.id = `banner-${bannerId}-${TargetId}`;

      const quizContentWrapper = document.createElement('div');
      quizContentWrapper.classList.add('quiz-content-wrapper');

      const quizWidgetWrapperContent = document.createElement('div');
      quizWidgetWrapperContent.classList.add('quiz-widget-wrapper-content');
      quizWidgetWrapperContent.style.flexDirection = setAdAlignment(quiz?.ads_alignment)
      quizWidgetWrapperContent.id = `data-quiz-id-${bannerId}-${TargetId}`

      const quizBox = document.createElement('div');
      quizBox.classList.add('quiz-box');

      //Question
      const quizQuestion = document.createElement('div');
      quizQuestion.classList.add('quiz-question');
      quizQuestion.textContent = quiz.question;

      // Button Container
      const optionContainer = document.createElement('div');
      optionContainer.id = `quiz-option-container-${bannerId}-${TargetId}`;

      // Quiz Options
      quiz.options.forEach((option, index) => {
        //Parent div
        const div = document.createElement('div');
        div.id = `option-${index}-${bannerId}-${TargetId}`;
        div.value = option
        div.textContent = option        
        div.classList.add('quiz-option');

        //to change selected options style
        div.addEventListener('click', handleOptionClick);

        optionContainer.appendChild(div);
      })

      //submit button for selected option
      const submitButton = document.createElement('button');
      submitButton.classList.add('submit-quiz-btn');
      submitButton.textContent = 'Check Answer';
      submitButton.addEventListener('click', async (event) => {
        event.preventDefault();
        // send selected option to server
        const status = await PostUserResponse(bannerId, selectedOption);
        if (status) {
          quizBox.removeChild(submitButton)

          //change style of selected option to green if correct else red and green the correct one
          const correctOption = quiz.answer
          const selectedOptionElement = document.getElementById(`option-${quiz.options.indexOf(selectedOption)}-${bannerId}-${TargetId}`);

          if (correctOption === selectedOption) {
            selectedOptionElement.style.backgroundColor = '#9feb8e';
            selectedOptionElement.style.color = '#000000';
            selectedOptionElement.innerHTML = `${selectedOption}<span class="list-icon1"><img src="${assetsUrl}/tick.svg" alt="tick" /></span>`
          }
          else {
            selectedOptionElement.style.backgroundColor ='#fca7a1';
            selectedOptionElement.style.color = '#000000';
            selectedOptionElement.innerHTML = `${selectedOption}<span class="list-icon1"><img src="${assetsUrl}/cross.svg" alt="tick" /></span>`
            const correctOptionElement = document.getElementById(`option-${quiz.options.indexOf(correctOption)}-${bannerId}-${TargetId}`);
            correctOptionElement.style.backgroundColor = '#9feb8e';
            correctOptionElement.style.color = '#000000';
            correctOptionElement.style.borderColor = 'transparent';
            correctOptionElement.innerHTML = `${correctOption}<span class="list-icon1"><img src="${assetsUrl}/tick.svg" alt="tick" /></span>`
          }

          //remove event listener from all options
          const otherOptions = optionContainer.querySelectorAll('.quiz-option');
          otherOptions.forEach((otherOption) => {
            otherOption.removeEventListener('click', handleOptionClick);
          });
          } else {
          console.log('Failed to submit response. Please try again.');
        }
      });

      quizBox.appendChild(quizQuestion);
      quizBox.appendChild(optionContainer);
      quizBox.appendChild(submitButton)

      const adContent = await renderAdContent(quiz)

      quizWidgetWrapperContent.appendChild(quizBox);
      quizWidgetWrapperContent.appendChild(adContent);
      
      quizContentWrapper.appendChild(quizWidgetWrapperContent);

      const headingContent = renderQuizHeading(quiz)

      quizContainerWidgets.appendChild(headingContent);
      quizContainerWidgets.appendChild(quizContentWrapper);

      const targetElement = document.querySelector(targetSelector);
      if (targetElement) {
        targetElement.appendChild(quizContainerWidgets);
      } else {
        console.error(`Target element "${targetSelector}" not found. Appending to body instead.`);
      }

    } else {
      console.error('No summary or detail available.');
    }
  };

  RenderQuizBanner(id, targetSelector);
};

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
loadSummaryCSS(`${scriptUrl}/summary-style.css`); // Replace with your hosted CSS file URL
// loadSummaryCSS('summary-style.css'); // Replace with your hosted CSS file URL

window.SummaryNamespace = window.SummaryNamespace || {};

window.SummaryNamespace.GetSummaryBanner = (id, targetSelector) => {
  const fetchApi = async (id) => {
    try {
      const res = await fetch(`${APIURL}/api/summary/${id}`);
      const data = await res.json();
      if (data?.summary) {
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
      const res = await fetch(`${APIURL}/api/ad?type=${type}`);
      const data = await res.json();
      if (data?.ad_html) {
        return data.ad_html;
      }
    } catch (error) {
      console.error('Error fetching ad data:', error);
      return null;
    }
  };

  const postClickSummary = async (summaryId, summaryLength) => {
    try {
      const res = await fetch(`${APIURL}/click_summary`, 
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            summary_id: summaryId,
            summary_length: summaryLength,
          }),
        }
      )
      const resStatus = await res.json()
      if (resStatus.success) {
        console.log('Summary click logged successfully')
      }
    } catch (error) {
      console.error('Failed to log summary click', error)
    }
  }

  const setAdAlignment = (align) => {
    if (align === 'left') {
      return "row-reverse"
    }
    else if (align === 'top') {
      return 'column-reverse'
    }
    else if (align === 'bottom') {
      return 'column'
    }
  }

  const handleClick = async (summaryId, summaryLength) => {
    await postClickSummary(summaryId, summaryLength)
  }

  const RenderSummaryBanner = async (bannerId, targetSelector = '#my-custom-container') => {
    const data = await fetchApi(bannerId);
    const summary = data?.summary
    const adHtml = await fetchAdApi('summary');

    const renderSummaryHeading = (data) => {
      const headingContainer = document.createElement('div')
      headingContainer.classList.add('summary-plugin-heading-text')

      const headingBG = document.createElement('div')
      headingBG.classList.add('summary-heading-bg')  //summary is not a typo, I am trying to match the class names as per the css

      const pluginName = document.createElement('div');
      pluginName.classList.add('summary-plugin-name');

      const titleAnimation = document.createElement('div');
      titleAnimation.classList.add('summary-title-animation');
      const text = document.createElement('h2');
      text.textContent = data?.badge_text ? data?.badge_text : 'YM Summary';
      pluginName.appendChild(titleAnimation);
      pluginName.appendChild(text);

      const headingContent = document.createElement('div')
      headingContent.classList.add('summary-section-heading')

      const headingText = document.createElement('div')
      headingText.classList.add('summary-section-heading-text')
      headingText.innerHTML = `<h3 class="summary-heading">${data?.header_title || ""}</h3><div class="summary-sub-heading"><a href=${data?.click_through_url_link || ""}>${data?.click_through_url_text || ""}</a></div>`

      const headingIcon = document.createElement('div')
      headingIcon.classList.add('summary-section-heading-icon')
      headingIcon.innerHTML = `<img alt="#" data-src="${assetsUrl}/Untitled-1.gif" class=" lazyloaded" src="${assetsUrl}/Untitled-1.gif">`

      headingContent.appendChild(headingText)
      headingContent.appendChild(headingIcon)

      headingContainer.appendChild(headingBG);
      headingContainer.appendChild(pluginName);
      headingContainer.appendChild(headingContent);

      if (data?.header_visibity === 'True') {
        return headingContainer;
      }
      else {
        pluginName.style.cssText = "top: 18.5px; margin-left: 20px; z-index: 1;"
        return pluginName
      }
    }

    if (summary && adHtml) {
      // The parent container
      const summaryContainer = document.createElement('div');
      summaryContainer.classList.add('summary-container-widgets');

      // Create the banner container
      const summaryContentWrapper = document.createElement('div');
      summaryContentWrapper.classList.add('summary-content-wrapper');
      summaryContentWrapper.id = `banner-${bannerId}-${targetSelector.replace('#', '')}`;

      const pluginData = document.createElement('div');
      pluginData.classList.add('summary-widget-wrapper-content');
      pluginData.style.flexDirection = setAdAlignment(data?.ads_alignment)

      const summaryContentBlock = document.createElement('div');
      summaryContentBlock.classList.add('summary-content-block');

      // For ad
      const AdContent = document.createElement('div');
      AdContent.classList.add('summary-ad-content');
      AdContent.style.display = data?.ads_visibilty === "False" ? 'none' : 'flex';
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

      const headingContainer = renderSummaryHeading(data);
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
        handleClick(bannerId, 'long')
    });

      radioMedium.addEventListener('change', () => {
        contentDiv.innerHTML = `<p>${summary.medium}</p>`;
        handleClick(bannerId, 'medium')
      });

      radioShort.addEventListener('change', () => {
        contentDiv.innerHTML = `<p>${summary.short}</p>`;
        handleClick(bannerId,'short')
      });
    } else {
      console.error('No summary or detail available.');
    }
  };

  RenderSummaryBanner(id, targetSelector);
};