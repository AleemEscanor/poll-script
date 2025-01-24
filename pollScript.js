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
  
    const RenderPollResults = (pollResultArr) => {
      const pollResultDiv = document.createElement('div');
  
      pollResultArr.forEach(({ answer, percentage}) => {
        const answerDiv = document.createElement('div');
        answerDiv.textContent = answer;
  
        const percentageDiv = document.createElement('div');
        percentageDiv.textContent = `${percentage}%`;
        
        const outerdiv = document.createElement('div');
        outerdiv.style.width = '100%';
        outerdiv.style.border = '1px solid black';
  
        const innerdiv = document.createElement('div');
        innerdiv.style.width = `${percentage}%`;
        innerdiv.style.height = '5px';
        innerdiv.style.backgroundColor = 'green';
        innerdiv.style.padding = '5px';
        
        outerdiv.appendChild(innerdiv);
  
        pollResultDiv.appendChild(answerDiv)
        pollResultDiv.appendChild(percentageDiv)
        pollResultDiv.appendChild(outerdiv)
      })
  
      return pollResultDiv;
  
    }
  const RenderPollBanner = async (bannerId, targetSelector) => {
      const poll = await fetchApi(bannerId);
      let selectedOption;
      if (poll) {
        // Create the banner container
        const div = document.createElement('div');
        div.classList.add('custom-data-box');
        div.style.border = '1px solid #ccc';
        div.style.padding = '20px';
        div.style.margin = '20px';
        div.style.backgroundColor = '#f4f4f4';
        div.id = `banner-${bannerId}`;
  
  
  
        //Question Title
        const titleDiv = document.createElement('div');
        titleDiv.classList.add('poll-title');
        titleDiv.textContent = poll.question;
  
        // Radio Container
        const radioContainer = document.createElement('div');
        radioContainer.style.display
        const radioName = `pollType-${bannerId}`;
  
        // Poll Options
        poll.options.forEach((option, index) => {
          //Parent div
          const div = document.createElement('div');
          div.classList.add('poll-option');
  
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
  
        //submit button for selected option
        const submitButton = document.createElement('button');
        submitButton.textContent = 'Submit';
        submitButton.addEventListener('click', async (event) => {
          event.preventDefault();
          // send selected option to server
          const status = await PostUserResponse(bannerId, poll.question, selectedOption);
          if (status) {
            // alert('Your response has been submitted successfully');
            div.removeChild(radioContainer);
            div.removeChild(submitButton)
  
            //get poll results
            const pollResults = await getPollResults(bannerId, poll.question);
            const pollResultElement = RenderPollResults(pollResults)
            div.appendChild(pollResultElement)
            console.log('pollresults',pollResults)
            } else {
            alert('Failed to submit response. Please try again.');
          }
        });
  
        div.appendChild(titleDiv);
        div.appendChild(radioContainer);
        div.appendChild(submitButton)
  
        const targetElement = document.querySelector(targetSelector);
        if (targetElement) {
          targetElement.appendChild(div);
        } else {
          console.error(`Target element "${targetSelector}" not found. Appending to body instead.`);
          document.body.appendChild(div);
        }
  
      } else {
        console.error('No summary or detail available.');
      }
    };
  
    RenderPollBanner(id, targetSelector);
  };

  
  
  