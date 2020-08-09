let settingsForm = `
    <form>
        <div class="form-control">
            <label for="message" data-i18n="message">Message</label>
            <input name="message" type="text" />
        </div>
        <div class="form-control">
            <label for="lang" data-i18n="language">Language</label>
            <input type="radio" name="lang" value="en" /> english 
            <input type="radio" name="lang" value="es" /> español
        </div>
        <p class="alert success"></p>
        <p class="alert error"></p>
        <p>
            <button class="button" type="submit" data-i18n="save">Save</button>
        </p>
    </form>`