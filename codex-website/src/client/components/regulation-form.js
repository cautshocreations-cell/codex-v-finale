function createRegulationForm(onSubmit) {
    const form = document.createElement('form');
    form.id = 'regulation-form';

    const titleLabel = document.createElement('label');
    titleLabel.textContent = 'Regulation Title:';
    const titleInput = document.createElement('input');
    titleInput.type = 'text';
    titleInput.name = 'title';
    titleInput.required = true;

    const descriptionLabel = document.createElement('label');
    descriptionLabel.textContent = 'Description:';
    const descriptionInput = document.createElement('textarea');
    descriptionInput.name = 'description';
    descriptionInput.required = true;

    const submitButton = document.createElement('button');
    submitButton.type = 'submit';
    submitButton.textContent = 'Submit';

    form.appendChild(titleLabel);
    form.appendChild(titleInput);
    form.appendChild(descriptionLabel);
    form.appendChild(descriptionInput);
    form.appendChild(submitButton);

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const regulationData = {
            title: titleInput.value,
            description: descriptionInput.value,
        };
        onSubmit(regulationData);
        form.reset();
    });

    return form;
}

export default createRegulationForm;