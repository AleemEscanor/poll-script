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
loadCSS('https://shefaligoyal17.github.io/quiz-script/quiz-style.css'); // Replace with your hosted CSS file URL

window.QuizNamespace = window.QuizNamespace || {};

window.QuizNamespace.GetQuizBanner = (id, targetSelector = '#my-custom-container') => {
  const fetchApi = async (id) => {
    try {
      const res = await fetch(`https://post-summary.yukta.one/api/quiz/${id}`);
      const data = await res.json();
      if (data?.quiz?.length > 0) {
        return data?.quiz[0];
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
      const res = await fetch(`https://post-summary.yukta.one/submit_quiz`, {
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

  const renderAdContent = async () => {
    const adContainer = document.createElement('div');
    adContainer.classList.add('ad-container');

    const adHtml = await fetchAdApi('quiz')
    adContainer.innerHTML = adHtml;
    return adContainer;
  }

  const renderQuizHeading = () => {
    const headingContainer = document.createElement('div')
    headingContainer.classList.add('plugin-heading-text')

    const headingBG = document.createElement('div')
    headingBG.classList.add('pull-heading-bg')  //pull is not a typo, I am trying to match the class names as per the css

    const pluginName = document.createElement('div');
    pluginName.classList.add('pull-plugin-name');

    const titleAnimation = document.createElement('div');
    titleAnimation.classList.add('title-animation');
    const text = document.createElement('h2');
    text.textContent = 'YM Quiz';
    pluginName.appendChild(titleAnimation);
    pluginName.appendChild(text);

    const headingContent = document.createElement('div')
    headingContent.classList.add('section-heading')

    const headingText = document.createElement('div')
    headingText.classList.add('pull-section-heading-text')
    headingText.innerHTML = '<h3 class="summary-heading">Gift and Voucher for Premium Customers</h3><div class="sub-heading"><a href="">View T&amp;C</a></div>'

    const headingIcon = document.createElement('div')
    headingIcon.classList.add('section-heading-icon')
    headingIcon.innerHTML = '<img alt="#" data-src="https://raw.githubusercontent.com/shefaligoyal17/quiz-script/refs/heads/main/assets/img/Sun.gif" class=" lazyloaded" src="https://raw.githubusercontent.com/shefaligoyal17/quiz-script/refs/heads/main/assets/img/Sun.gif">'

    headingContent.appendChild(headingText)
    headingContent.appendChild(headingIcon)

    headingContainer.appendChild(headingBG);
    headingContainer.appendChild(pluginName);
    headingContainer.appendChild(headingContent);

    return headingContainer;
  }

  const RenderQuizBanner = async (bannerId, targetSelector) => {
    const quiz = await fetchApi(bannerId);
    let selectedOption;

    // Define the event listener function
    const handleOptionClick = (event) => {
      event.preventDefault();
      selectedOption = event.target.value;
      // Change the background color of other options
      const optionContainer = document.querySelector('#quiz-option-container');
      const otherOptions = optionContainer.querySelectorAll('.quiz-option');
      otherOptions.forEach((otherOption) => {
        otherOption.style.backgroundColor = 'white';
      });
      const div = document.querySelector(`#option-${quiz.options.indexOf(selectedOption)}-${bannerId}`);
      div.style.backgroundColor = '#e8e8e8';
      div.style.color = 'black';
      div.style.borderColor =  'transparent'
    }

    if (quiz) {
      // Create the banner container
      const quizContainerWidgets = document.createElement('div');
      quizContainerWidgets.classList.add('quiz-container-widgets');
      quizContainerWidgets.id = `banner-${bannerId}`;

      const quizContentWrapper = document.createElement('div');
      quizContentWrapper.classList.add('quiz-content-wrapper');

      const quizWidgetWrapperContent = document.createElement('div');
      quizWidgetWrapperContent.classList.add('quiz-widget-wrapper-content');
      quizWidgetWrapperContent.id = `data-quiz-id-${bannerId}`

      const quizBox = document.createElement('div');
      quizBox.classList.add('quiz-box');

      //Question
      const quizQuestion = document.createElement('div');
      quizQuestion.classList.add('question');
      quizQuestion.textContent = quiz.question;

      // Button Container
      const optionContainer = document.createElement('div');
      optionContainer.id = 'quiz-option-container';

      // Quiz Options
      quiz.options.forEach((option, index) => {
        //Parent div
        const div = document.createElement('div');
        div.id = `option-${index}-${bannerId}`;
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
          const selectedOptionElement = document.getElementById(`option-${quiz.options.indexOf(selectedOption)}-${bannerId}`);

          if (correctOption === selectedOption) {
            selectedOptionElement.style.backgroundColor = '#9feb8e';
            selectedOptionElement.style.color = '#000000';
            selectedOptionElement.innerHTML = `${selectedOption}<span class="list-icon1"><img src="https://raw.githubusercontent.com/shefaligoyal17/quiz-script/bf354b81846122f19438cb627b1af0bd44e37414/assets/img/tick.svg" alt="tick" /></span>`
          }
          else {
            selectedOptionElement.style.backgroundColor ='#fca7a1';
            selectedOptionElement.style.color = '#000000';
            selectedOptionElement.innerHTML = `${selectedOption}<span class="list-icon1"><img src="https://raw.githubusercontent.com/shefaligoyal17/quiz-script/bf354b81846122f19438cb627b1af0bd44e37414/assets/img/cross.svg" alt="tick" /></span>`
            const correctOptionElement = document.getElementById(`option-${quiz.options.indexOf(correctOption)}-${bannerId}`);
            correctOptionElement.style.backgroundColor = '#9feb8e';
            correctOptionElement.style.color = '#000000';
            correctOptionElement.style.borderColor = 'transparent';
            correctOptionElement.innerHTML = `${correctOption}<span class="list-icon1"><img src="https://raw.githubusercontent.com/shefaligoyal17/quiz-script/bf354b81846122f19438cb627b1af0bd44e37414/assets/img/tick.svg" alt="tick" /></span>`
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

      const adContent = await renderAdContent()

      quizWidgetWrapperContent.appendChild(quizBox);
      quizWidgetWrapperContent.appendChild(adContent);
      
      quizContentWrapper.appendChild(quizWidgetWrapperContent);

      const headingContent = renderQuizHeading()

      quizContainerWidgets.appendChild(headingContent);
      quizContainerWidgets.appendChild(quizContentWrapper);

      const targetElement = document.querySelector(targetSelector);
      if (targetElement) {
        targetElement.appendChild(quizContainerWidgets);
      } else {
        console.error(`Target element "${targetSelector}" not found. Appending to body instead.`);
        document.body.appendChild(quizContainerWidgets);
      }

    } else {
      console.error('No summary or detail available.');
    }
  };

  RenderQuizBanner(id, targetSelector);
};
