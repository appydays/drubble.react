import React from 'react';
import Modal from './Modal';

function SplashHelpModal({ isOpen, onClose }) {

    return (
        <Modal className="help" isOpen={isOpen} onClose={onClose}>
            <h2>Sut i chwarae ScramAir</h2>

            <div className="help-content scroll-fade">
                <div className="help-content__wrapper">
                    <div>
                        <div>
                            <span>Crewch y gair hiraf posibl o'r 9 llythyren sydd ar gael. Mae llythrennau yn cael eu dewis ar hap ac yn newid yn ddyddiol, e.e.</span><br/>
                            <div className="tile-container daily-letters">
                                <div className="tile "><span className="front">A</span><span className="back">A</span>
                                </div>
                                <div className="tile "><span className="front">LL</span><span className="back">LL</span>
                                </div>
                                <div className="tile "><span className="front">W</span><span className="back">W</span>
                                </div>
                                <div className="tile "><span className="front">I</span><span className="back">I</span>
                                </div>
                                <div className="tile "><span className="front">R</span><span className="back">R</span>
                                </div>
                                <div className="tile "><span className="front">O</span><span className="back">O</span>
                                </div>
                                <div className="tile "><span className="front">M</span><span className="back">M</span>
                                </div>
                                <div className="tile "><span className="front">TH</span><span className="back">TH</span>
                                </div>
                                <div className="tile "><span className="front">P</span><span className="back">P</span>
                                </div>
                            </div>
                            <ul>
                                <li>Cliciwch ar y llythrennau i sillafu gair, bydd llythrennau dethol yn cael eu hanalluogi a bydd ymddangos yn y rhes geiriau.</li>
                                <li>Teipiwch y gair pan fyddwch chi'n barod, neu defnyddiwch y botwm Dileu ⌫ i ddadwneud y llythrennau a ddewiswyd gennych.</li>
                                <li>Bydd geiriau dilys yn cael eu hychwanegu at eich rhestr eiriau a gyflwynwyd.</li>
                                <li>Bydd geiriau annilys yn cael eu gwrthod.</li>
                                <li>Sgoriwch bwyntiau am air dilys, ond cewch well sgorau trwy ddefnyddio'r llythrennau llai aml os ydynt ar gael, e.e fel J ac TH.</li>
                            </ul>
                            <ul>
                                <li>I ad-drefnu y llythyrau, defnyddiwch y botwm Siffrwd <button className="shuffle-button">
                                    <svg stroke="currentColor" fill="currentColor" strokeWidth="0"
                                         viewBox="0 0 512 512"
                                         height="24" width="24" xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M504.971 359.029c9.373 9.373 9.373 24.569 0 33.941l-80 79.984c-15.01 15.01-40.971 4.49-40.971-16.971V416h-58.785a12.004 12.004 0 0 1-8.773-3.812l-70.556-75.596 53.333-57.143L352 336h32v-39.981c0-21.438 25.943-31.998 40.971-16.971l80 79.981zM12 176h84l52.781 56.551 53.333-57.143-70.556-75.596A11.999 11.999 0 0 0 122.785 96H12c-6.627 0-12 5.373-12 12v56c0 6.627 5.373 12 12 12zm372 0v39.984c0 21.46 25.961 31.98 40.971 16.971l80-79.984c9.373-9.373 9.373-24.569 0-33.941l-80-79.981C409.943 24.021 384 34.582 384 56.019V96h-58.785a12.004 12.004 0 0 0-8.773 3.812L96 336H12c-6.627 0-12 5.373-12 12v56c0 6.627 5.373 12 12 12h110.785c3.326 0 6.503-1.381 8.773-3.812L352 176h32z"></path>
                                    </svg>
                                    &nbsp;Siffrwd</button>
                                </li>
                                <li>I gyfnewid llythyrau allan, Defnyddiwch y botwm Cyfnewid <button className="exchange-button">
                                    <svg stroke="currentColor" fill="currentColor" strokeWidth="0"
                                         viewBox="0 0 512 512"
                                         height="24" width="24" xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M0 168v-16c0-13.255 10.745-24 24-24h360V80c0-21.367 25.899-32.042 40.971-16.971l80 80c9.372 9.373 9.372 24.569 0 33.941l-80 80C409.956 271.982 384 261.456 384 240v-48H24c-13.255 0-24-10.745-24-24zm488 152H128v-48c0-21.314-25.862-32.08-40.971-16.971l-80 80c-9.372 9.373-9.372 24.569 0 33.941l80 80C102.057 463.997 128 453.437 128 432v-48h360c13.255 0 24-10.745 24-24v-16c0-13.255-10.745-24-24-24z"></path>
                                    </svg>
                                    &nbsp;Cyfnewid</button> - dewiswch y llythrennau yn y blychau geiriau a chliciwch ar gyfnewid. <br/>
                                    <br/><b>*Rhybudd</b> bydd cyfnewid llythyrau yn costio slot geiriau i chi gan leihau eich gallu i sgorio pwyntiau!
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div>
                        <p>Mae 5 rownd a bydd gennych 5 munud i gyflwyno 5 gair.</p>
                        <p>Ar ôl i bob gair gael ei fewnbynnu bydd y llythrennau a ddefnyddir yn cael eu disodli gan y math, llafariad neu gytsain cyfatebol.<br/></p>
                    </div>

                    <div>
                        <p>Nid oes rhaid i chi greu cyfrif i chwarae, fodd bynnag, os nad ydych wedi mewngofnodi - ni fydd eich sgôr yn cael ei ychwanegu at y bwrdd arweinwyr!</p>
                        <p>Bydd cofrestru i chwarae yn eich galluogi i chwarae yn erbyn eich ffrindiau a'ch teulu, gweld a allwch chi eu curo neu geisio cyrraedd yr 20 uchaf!</p>
                    </div>
                    <div>Diolch yn fawr... a Pob Lwc!</div>
                    <div><br/><br/></div>
                </div>
            </div>

        </Modal>
);
}

export default SplashHelpModal;
