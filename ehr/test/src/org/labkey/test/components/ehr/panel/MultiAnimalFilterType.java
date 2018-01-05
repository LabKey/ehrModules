/*
 * Copyright (c) 2016-2017 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.labkey.test.components.ehr.panel;

import org.labkey.test.Locator;
import org.labkey.test.components.ext4.ComboBox;
import org.labkey.test.components.ext4.Window;
import org.labkey.test.components.html.Input;
import org.labkey.test.components.ldk.panel.AbstractFilterType;
import org.labkey.test.pages.ehr.AnimalHistoryPage;
import org.labkey.test.selenium.LazyWebElement;
import org.openqa.selenium.WebElement;

import static org.labkey.test.Locator.NBSP;
import static org.labkey.test.components.ext4.ComboBox.ComboBox;
import static org.labkey.test.components.html.Input.Input;
import static org.labkey.test.util.Ext4Helper.Locators.ext4Button;

public class MultiAnimalFilterType<A extends AnimalHistoryPage> extends AbstractFilterType<A>
{
    public static final Locator.XPathLocator subjectButtonPanel = Locator.id("subjectButtonPanel");

    private final Input subjectInput = new Input(Locator.name("subjectIds").findWhenNeeded(this), getDriver())
    {
        @Override
        public void set(String value)
        {
            super.set(value);
            blur();
        }
    };
    private final WebElement addButton = new MultiAnimalFilterUpdateButton("Add");
    private final WebElement replaceButton = new MultiAnimalFilterUpdateButton("Replace");
    private final WebElement clearButton = new MultiAnimalFilterUpdateButton("Clear");
    private final WebElement roomCageLink = Locator.id("roomCageLink").findWhenNeeded(this);
    private final WebElement projectProtocolLink = Locator.id("projectProtocolLink").findWhenNeeded(this);

    public MultiAnimalFilterType(A sourcePage)
    {
        super(sourcePage);
    }

    @Override
    protected String getRadioName()
    {
        return "multiSubject";
    }

    @Override
    protected String getIdPrefix()
    {
        return "ehr-multianimalfiltertype";
    }

    public MultiAnimalFilterType<A> addSubjects(String subjectIds)
    {
        subjectInput.set(subjectIds);
        addButton.click();
        return this;
    }

    public MultiAnimalFilterType<A> replaceSubjects(String subjectIds)
    {
        subjectInput.set(subjectIds);
        replaceButton.click();
        return this;
    }

    public MultiAnimalFilterType<A> clearSubjects()
    {
        clearButton.click();
        return this;
    }

    public RoomCageSearchWindow searchByRoomCage()
    {
        roomCageLink.click();
        return new RoomCageSearchWindow(roomCageLink.getText());
    }

    public ProjectProtocolSearchWindow searchByProjectProtocol()
    {
        projectProtocolLink.click();
        return new ProjectProtocolSearchWindow(projectProtocolLink.getText());
    }

    private abstract class SearchWindow extends Window
    {
        protected final ComboBox.ComboListMatcher _comboMatcher = (loc, text) -> loc.withText(text + NBSP);

        public SearchWindow(String windowTitle)
        {
            super(windowTitle.substring(1, windowTitle.length() - 1), MultiAnimalFilterType.this.getDriver()); // Trim brackets from link text
        }

        public A clickSubmit()
        {
            clickButton("Submit", true);
            return getPage();
        }

        public A clickClose()
        {
            clickButton("Close", true);
            return getPage();
        }
    }

    public class RoomCageSearchWindow extends SearchWindow
    {
        private final ComboBox roomCombo = ComboBox(getDriver()).withLabel("Room:").findWhenNeeded(this).setMatcher(_comboMatcher);
        private final Input cageInput = Input(Locator.name("cageField"), getDriver()).findWhenNeeded(this);

        public RoomCageSearchWindow(String title)
        {
            super(title);
        }

        public RoomCageSearchWindow selectRoom(String room)
        {
            roomCombo.selectComboBoxItem(room);
            return this;
        }

        public RoomCageSearchWindow setCage(String cage)
        {
            cageInput.set(cage);
            return this;
        }
    }

    public class ProjectProtocolSearchWindow extends SearchWindow
    {
        private final ComboBox projectCombo = ComboBox(getDriver()).withIdPrefix("ehr-projectfield").findWhenNeeded(this).setMatcher(_comboMatcher);
        private final ComboBox protocolCombo = ComboBox(getDriver()).withIdPrefix("ehr-protocolfield").findWhenNeeded(this).setMatcher(_comboMatcher);

        public ProjectProtocolSearchWindow(String title)
        {
            super(title);
        }

        public ProjectProtocolSearchWindow selectProject(String project)
        {
            projectCombo.selectComboBoxItem(project);
            return this;
        }

        public ProjectProtocolSearchWindow selectProtocol(String protocol)
        {
            protocolCombo.selectComboBoxItem(protocol);
            return this;
        }
    }

    private class MultiAnimalFilterUpdateButton extends LazyWebElement
    {
        public MultiAnimalFilterUpdateButton(String buttonText)
        {
            super(ext4Button(buttonText), MultiAnimalFilterType.this);
        }

        @Override
        public void click()
        {
            getWrapper().doAndWaitForElementToRefresh(super::click, subjectButtonPanel, getWrapper().shortWait());
        }
    }
}
